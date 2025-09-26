import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';

const ReviewForm = ({ onReviewAdded, editingReview = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    movieTitle: editingReview?.movieTitle || '',
    userName: editingReview?.userName || '',
    rating: editingReview?.rating || 5,
    comment: editingReview?.comment || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.movieTitle.trim() || !formData.userName.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingReview) {
        await reviewAPI.updateReview(editingReview._id, formData);
        toast.success('Review updated successfully! 🎉');
      } else {
        await reviewAPI.createReview(formData);
        toast.success('Review added successfully! 🎉');
        // Reset form after successful submission
        setFormData({
          movieTitle: '',
          userName: '',
          rating: 5,
          comment: ''
        });
      }
      
      if (onReviewAdded) onReviewAdded();
      if (onCancel) onCancel(); // Close edit mode
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        className={`star ${star <= formData.rating ? '' : 'empty'}`}
        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.25rem'
        }}
      >
        ⭐
      </button>
    ));
  };

  return (
    <div className="card">
      <h2>{editingReview ? '✏️ Edit Review' : '➕ Add New Review'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="movieTitle">Movie Title *</label>
          <input
            type="text"
            id="movieTitle"
            name="movieTitle"
            value={formData.movieTitle}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter movie title..."
            required
            maxLength="200"
          />
        </div>

        <div className="form-group">
          <label htmlFor="userName">Your Name *</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your name..."
            required
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label>Rating *</label>
          <div className="rating-stars" style={{ margin: '0.5rem 0' }}>
            {renderStars()}
            <span style={{ marginLeft: '1rem', color: '#718096' }}>
              {formData.rating} out of 5 stars
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Review Comment *</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Share your thoughts about the movie..."
            required
            maxLength="1000"
            rows="5"
          />
          <small style={{ color: '#718096' }}>
            {formData.comment.length}/1000 characters
          </small>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                {editingReview ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                {editingReview ? '💾 Update Review' : '🚀 Submit Review'}
              </>
            )}
          </button>
        </div>
      </form>

      {!editingReview && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#e6fffa', 
          borderRadius: '8px',
          borderLeft: '4px solid #38b2ac'
        }}>
          <h4 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
            🤖 AI-Powered Sentiment Analysis
          </h4>
          <p style={{ color: '#4a5568', fontSize: '0.875rem', margin: 0 }}>
            Your review will be automatically analyzed for sentiment using advanced AI. 
            We'll detect whether your review is positive, negative, or neutral to help 
            other users understand the overall reception of movies!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;