const express = require('express');
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
  searchMovies
} = require('../controllers/reviewController');

const router = express.Router();

// GET /api/reviews/stats - Get review statistics
router.get('/stats', getReviewStats);

// GET /api/reviews/search - Search movies by title
router.get('/search', searchMovies);

// GET /api/reviews - Get all reviews with pagination and filtering
router.get('/', getReviews);

// GET /api/reviews/:id - Get a single review by ID
router.get('/:id', getReviewById);

// POST /api/reviews - Create a new review
router.post('/', createReview);

// PUT /api/reviews/:id - Update a review
router.put('/:id', updateReview);

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', deleteReview);

module.exports = router;