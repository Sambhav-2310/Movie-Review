const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieTitle: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxLength: [200, 'Movie title cannot exceed 200 characters']
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxLength: [100, 'User name cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxLength: [1000, 'Comment cannot exceed 1000 characters']
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0,
    min: -1,
    max: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ movieTitle: 1, createdAt: -1 });
reviewSchema.index({ sentiment: 1 });
reviewSchema.index({ rating: 1 });

// Virtual field for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Method to get sentiment label with emoji
reviewSchema.methods.getSentimentWithEmoji = function() {
  const emojiMap = {
    'positive': '😊 Positive',
    'negative': '😞 Negative',
    'neutral': '😐 Neutral'
  };
  return emojiMap[this.sentiment] || '🤔 Unknown';
};

module.exports = mongoose.model('Review', reviewSchema);