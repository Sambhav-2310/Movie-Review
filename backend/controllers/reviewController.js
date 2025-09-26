const Review = require('../models/Review');
const sentimentService = require('../services/sentimentService');

// Get all reviews with pagination and filtering
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, movieTitle, sentiment, minRating, maxRating } = req.query;
    
    // Build filter object
    const filter = {};
    if (movieTitle) {
      // Use word boundary regex for better matching
      // This will match whole words or the beginning of words
      const escapedTitle = movieTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.movieTitle = { 
        $regex: `\\b${escapedTitle}|^${escapedTitle}`, 
        $options: 'i' 
      };
    }
    if (sentiment) {
      filter.sentiment = sentiment;
    }
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseInt(minRating);
      if (maxRating) filter.rating.$lte = parseInt(maxRating);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalReviews: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { movieTitle, userName, rating, comment } = req.body;

    // Validate required fields
    if (!movieTitle || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Analyze sentiment
    const sentimentResult = await sentimentService.analyzeSentiment(comment, rating);

    // Create review
    const review = new Review({
      movieTitle: movieTitle.trim(),
      userName: userName.trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score
    });

    const savedReview = await review.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: savedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { movieTitle, userName, rating, comment } = req.body;
    const reviewId = req.params.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update fields
    if (movieTitle) review.movieTitle = movieTitle.trim();
    if (userName) review.userName = userName.trim();
    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = comment.trim();

    // Re-analyze sentiment if comment or rating changed
    if (comment || rating) {
      const sentimentResult = await sentimentService.analyzeSentiment(
        review.comment, 
        review.rating
      );
      review.sentiment = sentimentResult.sentiment;
      review.sentimentScore = sentimentResult.score;
    }

    const updatedReview = await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Get review statistics
const getReviewStats = async (req, res) => {
  try {
    const { movieTitle } = req.query;
    
    // Build filter
    const filter = {};
    if (movieTitle) {
      filter.movieTitle = { $regex: movieTitle, $options: 'i' };
    }

    const reviews = await Review.find(filter);
    const stats = sentimentService.calculateSentimentStats(reviews);

    // Additional MongoDB aggregation for detailed stats
    const ratingDistribution = await Review.aggregate([
      ...(movieTitle ? [{ $match: filter }] : []),
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const sentimentByRating = await Review.aggregate([
      ...(movieTitle ? [{ $match: filter }] : []),
      {
        $group: {
          _id: {
            rating: '$rating',
            sentiment: '$sentiment'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.rating': 1, '_id.sentiment': 1 } }
    ]);

    const topMovies = await Review.aggregate([
      {
        $group: {
          _id: '$movieTitle',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
          positiveCount: {
            $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] }
          },
          negativeCount: {
            $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          positivePercentage: {
            $round: [{ $multiply: [{ $divide: ['$positiveCount', '$reviewCount'] }, 100] }, 1]
          }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        ratingDistribution,
        sentimentByRating,
        topMovies: topMovies.map(movie => ({
          ...movie,
          averageRating: Math.round(movie.averageRating * 100) / 100
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Search reviews by movie title
const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const movies = await Review.aggregate([
      {
        $match: {
          movieTitle: { 
            $regex: `\\b${escapedQuery}|^${escapedQuery}`, 
            $options: 'i' 
          }
        }
      },
      {
        $group: {
          _id: '$movieTitle',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          latestReview: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          movieTitle: '$_id',
          reviewCount: 1,
          averageRating: { $round: ['$averageRating', 1] },
          latestReview: 1,
          _id: 0
        }
      },
      { $sort: { reviewCount: -1, averageRating: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching movies',
      error: error.message
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
  searchMovies
};