import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API functions for reviews
export const reviewAPI = {
  // Get all reviews with optional filters
  getReviews: (params = {}) => {
    return api.get('/reviews', { params });
  },

  // Get a single review by ID
  getReviewById: (id) => {
    return api.get(`/reviews/${id}`);
  },

  // Create a new review
  createReview: (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Update a review
  updateReview: (id, reviewData) => {
    return api.put(`/reviews/${id}`, reviewData);
  },

  // Delete a review
  deleteReview: (id) => {
    return api.delete(`/reviews/${id}`);
  },

  // Get review statistics
  getStats: (movieTitle = '') => {
    const params = movieTitle ? { movieTitle } : {};
    return api.get('/reviews/stats', { params });
  },

  // Search movies
  searchMovies: (query) => {
    return api.get('/reviews/search', { params: { query } });
  }
};

// API functions for chatbot
export const chatbotAPI = {
  // Send message to chatbot
  sendMessage: async (message) => {
    try {
      // For demo purposes, we'll simulate chatbot responses
      // In a real implementation, this would call your chatbot service
      const response = await simulateChatbotResponse(message);
      return { data: { response } };
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  }
};

// Simulated chatbot responses for demo
const simulateChatbotResponse = async (message) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('sentiment') && lowerMessage.includes('avatar')) {
    return "Based on the Avatar reviews, I found mostly positive sentiment! 🎬 Users loved the visual effects and storytelling. Would you like me to show you the detailed sentiment breakdown?";
  } else if (lowerMessage.includes('best movie') || lowerMessage.includes('highest rated')) {
    return "Looking at the ratings, the highest-rated movies in our database have an average of 4.5+ stars! ⭐ Would you like to see the top-rated movies list?";
  } else if (lowerMessage.includes('negative') && lowerMessage.includes('reviews')) {
    return "I can help you find negative reviews! 📊 Most negative feedback focuses on pacing and character development. Would you like me to show specific examples?";
  } else if (lowerMessage.includes('stats') || lowerMessage.includes('statistics')) {
    return "Here are the current review statistics: We have reviews with 65% positive, 20% neutral, and 15% negative sentiment overall! 📈 Want more detailed stats?";
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! 👋 I'm your movie review sentiment assistant. I can help you analyze reviews, find sentiment patterns, and get insights about movies. What would you like to know?";
  } else {
    return "I'm here to help with movie review analysis! 🎭 You can ask me about:\n• Movie sentiment analysis\n• Review statistics\n• Top-rated movies\n• Negative/positive review patterns\n\nWhat interests you most?";
  }
};

export default api;