import React, { useState, useEffect, useCallback } from 'react';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';
import ReviewForm from './ReviewForm';

const ReviewList = ({ onReviewUpdated }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    movieTitle: '',
    sentiment: '',
    minRating: '',
    maxRating: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0
  });
  const [editingReview, setEditingReview] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchTerm && searchTerm.length >= 2) {
            try {
              const response = await reviewAPI.searchMovies(searchTerm);
              setSearchSuggestions(response.data.data);
              setShowSuggestions(true);
            } catch (error) {
              console.error('Error fetching suggestions:', error);
            }
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    fetchReviews();
  }, [filters, pagination.currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await reviewAPI.getReviews(params);
      setReviews(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Trigger debounced search for movie title
    if (name === 'movieTitle') {
      debouncedSearch(value);
    }
  };

  const handleSuggestionClick = (movieTitle) => {
    setFilters(prev => ({
      ...prev,
      movieTitle: movieTitle
    }));
    setShowSuggestions(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleInputFocus = () => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearFilters = () => {
    setFilters({
      movieTitle: '',
      sentiment: '',
      minRating: '',
      maxRating: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully! 🗑️');
      fetchReviews();
      if (onReviewUpdated) onReviewUpdated();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
  };

  const handleEditComplete = () => {
    setEditingReview(null);
    fetchReviews();
    if (onReviewUpdated) onReviewUpdated();
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className={`star ${star <= rating ? '' : 'empty'}`}
      >
        ⭐
      </span>
    ));
  };

  const getSentimentEmoji = (sentiment) => {
    const emojiMap = {
      'positive': '😊',
      'negative': '😞',
      'neutral': '😐'
    };
    return emojiMap[sentiment] || '🤔';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (editingReview) {
    return (
      <ReviewForm
        editingReview={editingReview}
        onReviewAdded={handleEditComplete}
        onCancel={() => setEditingReview(null)}
      />
    );
  }

  return (
    <div>
      <div className="card">
        <h2>🎬 Movie Reviews</h2>
        
        {/* Filters */}
        <div className="filters">
          <div className="filter-group" style={{ position: 'relative' }}>
            <label>Search Movie</label>
            <input
              type="text"
              name="movieTitle"
              value={filters.movieTitle}
              onChange={handleFilterChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search by movie title..."
              className="form-input"
              autoComplete="off"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {searchSuggestions.map((movie, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(movie.movieTitle)}
                  >
                    <div className="suggestion-title">{movie.movieTitle}</div>
                    <div className="suggestion-meta">
                      {movie.reviewCount} reviews • ⭐ {movie.averageRating}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="filter-group">
            <label>Sentiment</label>
            <select
              name="sentiment"
              value={filters.sentiment}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Sentiments</option>
              <option value="positive">😊 Positive</option>
              <option value="neutral">😐 Neutral</option>
              <option value="negative">😞 Negative</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Rating</label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Any</option>
              <option value="1">1+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Max Rating</label>
            <select
              name="maxRating"
              value={filters.maxRating}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Any</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="btn btn-secondary btn-small"
            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
          >
            🔄 Clear
          </button>
        </div>

        {/* Results Summary */}
        <div style={{ 
          padding: '1rem', 
          background: '#f7fafc', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ color: '#4a5568' }}>
            📊 Showing {reviews.length} of {pagination.totalReviews} reviews
          </span>
          <span style={{ color: '#718096', fontSize: '0.875rem' }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: '#718096', marginBottom: '1rem' }}>🎭 No Reviews Found</h3>
          <p style={{ color: '#a0aec0' }}>
            {Object.values(filters).some(v => v !== '') 
              ? 'Try adjusting your filters to see more reviews.' 
              : 'Be the first to add a movie review!'
            }
          </p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="review-meta">
                  <div className="review-title">{review.movieTitle}</div>
                  <div className="review-author">
                    By {review.userName} • {formatDate(review.createdAt)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div className="review-rating">
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                      ({review.rating}/5)
                    </span>
                  </div>
                  
                  <div className={`sentiment-badge sentiment-${review.sentiment}`}>
                    {getSentimentEmoji(review.sentiment)} {review.sentiment}
                  </div>
                </div>
              </div>

              <div className="review-comment">
                "{review.comment}"
              </div>

              {review.sentimentScore !== undefined && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#a0aec0', 
                  marginTop: '0.5rem'
                }}>
                  Confidence Score: {Math.abs(review.sentimentScore * 100).toFixed(1)}%
                </div>
              )}

              <div className="review-actions">
                <button
                  onClick={() => handleEdit(review)}
                  className="btn btn-secondary btn-small"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="btn btn-danger btn-small"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
          >
            ← Previous
          </button>
          
          {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
            const pageNumber = pagination.currentPage <= 3 
              ? index + 1 
              : Math.max(1, pagination.currentPage - 2) + index;
            
            if (pageNumber > pagination.totalPages) return null;
            
            return (
              <button
                key={pageNumber}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNumber }))}
                className={pagination.currentPage === pageNumber ? 'active' : ''}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;