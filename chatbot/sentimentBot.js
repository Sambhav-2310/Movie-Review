const axios = require('axios');

class SentimentBot {
  constructor(apiKey = null, apiEndpoint = 'http://localhost:5000/api') {
    this.apiKey = apiKey; // Claude/OpenAI API key
    this.apiEndpoint = apiEndpoint;
    this.conversationHistory = [];
  }

  // Analyze user query and generate appropriate response
  async processQuery(userMessage) {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Determine query type and generate response
      const queryType = this.classifyQuery(userMessage);
      let response;

      switch (queryType) {
        case 'sentiment_analysis':
          response = await this.handleSentimentAnalysis(userMessage);
          break;
        case 'movie_stats':
          response = await this.handleMovieStats(userMessage);
          break;
        case 'general_stats':
          response = await this.handleGeneralStats();
          break;
        case 'recommendations':
          response = await this.handleRecommendations(userMessage);
          break;
        case 'review_search':
          response = await this.handleReviewSearch(userMessage);
          break;
        case 'greeting':
          response = this.handleGreeting();
          break;
        default:
          response = await this.handleGeneral(userMessage);
          break;
      }

      // Add bot response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      return response;

    } catch (error) {
      console.error('Error processing query:', error);
      return "I apologize, but I encountered an error while processing your request. Please try again later! 🤖";
    }
  }

  // Classify user query into different types
  classifyQuery(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }

    if (lowerMessage.includes('sentiment') && 
        (lowerMessage.includes('of') || lowerMessage.includes('for') || lowerMessage.includes('about'))) {
      return 'sentiment_analysis';
    }

    if (lowerMessage.includes('stats') || lowerMessage.includes('statistics') || lowerMessage.includes('overview')) {
      return 'general_stats';
    }

    if (lowerMessage.includes('movie') && 
        (lowerMessage.includes('about') || lowerMessage.includes('tell me') || lowerMessage.includes('info'))) {
      return 'movie_stats';
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
        lowerMessage.includes('best') || lowerMessage.includes('top')) {
      return 'recommendations';
    }

    if (lowerMessage.includes('review') || lowerMessage.includes('negative') || 
        lowerMessage.includes('positive') || lowerMessage.includes('search')) {
      return 'review_search';
    }

    return 'general';
  }

  // Handle sentiment analysis requests for specific movies
  async handleSentimentAnalysis(message) {
    try {
      const movieTitle = this.extractMovieTitle(message);
      
      if (!movieTitle) {
        return "Please specify which movie you'd like me to analyze! For example: 'What's the sentiment of Avatar reviews?' 🎬";
      }

      const statsResponse = await axios.get(`${this.apiEndpoint}/reviews/stats`, {
        params: { movieTitle }
      });

      const stats = statsResponse.data.data.overview;

      if (stats.total === 0) {
        return `I couldn't find any reviews for "${movieTitle}". Would you like to add the first review? 🎭`;
      }

      const positivePercent = Math.round((stats.positive / stats.total) * 100);
      const negativePercent = Math.round((stats.negative / stats.total) * 100);
      const neutralPercent = Math.round((stats.neutral / stats.total) * 100);

      let sentimentSummary;
      if (positivePercent > 60) {
        sentimentSummary = "overwhelmingly positive! Audiences seem to love this movie! 🌟";
      } else if (negativePercent > 60) {
        sentimentSummary = "mostly negative. This movie seems to have divided opinions. 😞";
      } else if (positivePercent > negativePercent) {
        sentimentSummary = "generally positive with some mixed reactions. 😊";
      } else {
        sentimentSummary = "quite mixed with varied opinions. 🎭";
      }

      return `📊 Sentiment Analysis for "${movieTitle}":\n\n` +
             `Total Reviews: ${stats.total}\n` +
             `Average Rating: ${stats.averageRating}⭐/5\n\n` +
             `Sentiment Breakdown:\n` +
             `😊 Positive: ${stats.positive} (${positivePercent}%)\n` +
             `😐 Neutral: ${stats.neutral} (${neutralPercent}%)\n` +
             `😞 Negative: ${stats.negative} (${negativePercent}%)\n\n` +
             `Overall, the sentiment is ${sentimentSummary}\n\n` +
             `Would you like me to show you some specific reviews or analyze another movie? 🤔`;

    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      return "I'm having trouble accessing the sentiment data right now. Please try again later! 📊";
    }
  }

  // Handle general statistics requests
  async handleGeneralStats() {
    try {
      const statsResponse = await axios.get(`${this.apiEndpoint}/reviews/stats`);
      const stats = statsResponse.data.data.overview;
      const topMovies = statsResponse.data.data.topMovies.slice(0, 3);

      const positivePercent = Math.round((stats.positive / stats.total) * 100);
      const negativePercent = Math.round((stats.negative / stats.total) * 100);

      let response = `📈 Overall Review Statistics:\n\n`;
      response += `🎬 Total Reviews: ${stats.total}\n`;
      response += `⭐ Average Rating: ${stats.averageRating}/5\n`;
      response += `📊 Average Sentiment Score: ${stats.averageSentimentScore}\n\n`;
      
      response += `Sentiment Distribution:\n`;
      response += `😊 Positive: ${stats.positive} (${positivePercent}%)\n`;
      response += `😐 Neutral: ${stats.neutral} (${Math.round((stats.neutral / stats.total) * 100)}%)\n`;
      response += `😞 Negative: ${stats.negative} (${negativePercent}%)\n\n`;

      if (topMovies.length > 0) {
        response += `🏆 Top-Rated Movies:\n`;
        topMovies.forEach((movie, index) => {
          response += `${index + 1}. ${movie._id} (${movie.averageRating}⭐)\n`;
        });
        response += `\n`;
      }

      response += `💡 Insight: The community sentiment is ${positivePercent > 50 ? 'predominantly positive!' : 'quite mixed!'} `;
      response += `What specific movie or aspect would you like to explore? 🎭`;

      return response;

    } catch (error) {
      console.error('Error getting general stats:', error);
      return "I'm having trouble accessing the statistics right now. Please try again later! 📊";
    }
  }

  // Handle movie-specific information requests
  async handleMovieStats(message) {
    try {
      const movieTitle = this.extractMovieTitle(message);
      
      if (!movieTitle) {
        return "Which movie would you like to know more about? Please specify the movie title! 🎬";
      }

      const reviewsResponse = await axios.get(`${this.apiEndpoint}/reviews`, {
        params: { movieTitle, limit: 5 }
      });

      const reviews = reviewsResponse.data.data;

      if (reviews.length === 0) {
        return `I couldn't find any reviews for "${movieTitle}". Would you like to add the first review? ⭐`;
      }

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const sentimentCounts = reviews.reduce((acc, r) => {
        acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
        return acc;
      }, {});

      const latestReview = reviews[0];
      const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
        sentimentCounts[a] > sentimentCounts[b] ? a : b
      );

      let response = `🎭 "${movieTitle}" - Movie Information:\n\n`;
      response += `📊 ${reviews.length} review${reviews.length > 1 ? 's' : ''} found\n`;
      response += `⭐ Average Rating: ${avgRating.toFixed(1)}/5\n`;
      response += `🎭 Dominant Sentiment: ${this.getSentimentEmoji(dominantSentiment)} ${dominantSentiment}\n\n`;

      if (sentimentCounts.positive) response += `😊 Positive: ${sentimentCounts.positive} review${sentimentCounts.positive > 1 ? 's' : ''}\n`;
      if (sentimentCounts.neutral) response += `😐 Neutral: ${sentimentCounts.neutral} review${sentimentCounts.neutral > 1 ? 's' : ''}\n`;
      if (sentimentCounts.negative) response += `😞 Negative: ${sentimentCounts.negative} review${sentimentCounts.negative > 1 ? 's' : ''}\n\n`;

      response += `📝 Latest Review:\n`;
      response += `"${latestReview.comment.substring(0, 150)}${latestReview.comment.length > 150 ? '...' : ''}"\n`;
      response += `- ${latestReview.userName} (${latestReview.rating}⭐, ${this.getSentimentEmoji(latestReview.sentiment)})\n\n`;

      response += `Would you like to see more reviews or get sentiment analysis for another movie? 🤔`;

      return response;

    } catch (error) {
      console.error('Error getting movie stats:', error);
      return "I'm having trouble accessing movie information right now. Please try again later! 🎬";
    }
  }

  // Handle recommendation requests
  async handleRecommendations(message) {
    try {
      const statsResponse = await axios.get(`${this.apiEndpoint}/reviews/stats`);
      const topMovies = statsResponse.data.data.topMovies.slice(0, 5);

      if (topMovies.length === 0) {
        return "I don't have enough data to make recommendations yet. Add some reviews to get personalized suggestions! ⭐";
      }

      let response = `🎬 Top Movie Recommendations (Based on Ratings & Sentiment):\n\n`;
      
      topMovies.forEach((movie, index) => {
        const sentiment = movie.positivePercentage > 70 ? '😊 Highly Positive' : 
                         movie.positivePercentage > 50 ? '😊 Mostly Positive' : 
                         movie.positivePercentage > 30 ? '😐 Mixed' : '😞 Mostly Negative';
        
        response += `${index + 1}. 🎭 ${movie._id}\n`;
        response += `   ⭐ ${movie.averageRating}/5 (${movie.reviewCount} reviews)\n`;
        response += `   ${sentiment} (${movie.positivePercentage}% positive)\n\n`;
      });

      response += `💡 These movies have the highest ratings and best sentiment scores!\n`;
      response += `Want to know more about any of these movies? Just ask! 🤔`;

      return response;

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return "I'm having trouble generating recommendations right now. Please try again later! 🎬";
    }
  }

  // Handle review search requests
  async handleReviewSearch(message) {
    try {
      const lowerMessage = message.toLowerCase();
      let sentiment = '';
      let limit = 3;

      if (lowerMessage.includes('positive')) sentiment = 'positive';
      else if (lowerMessage.includes('negative')) sentiment = 'negative';
      else if (lowerMessage.includes('neutral')) sentiment = 'neutral';

      const reviewsResponse = await axios.get(`${this.apiEndpoint}/reviews`, {
        params: { sentiment, limit }
      });

      const reviews = reviewsResponse.data.data;

      if (reviews.length === 0) {
        const sentimentText = sentiment ? `${sentiment} ` : '';
        return `I couldn't find any ${sentimentText}reviews at the moment. Try adding some reviews first! 📝`;
      }

      const sentimentEmoji = sentiment === 'positive' ? '😊' : 
                           sentiment === 'negative' ? '😞' : 
                           sentiment === 'neutral' ? '😐' : '🎭';

      let response = `${sentimentEmoji} ${sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) + ' ' : ''}Reviews:\n\n`;

      reviews.forEach((review, index) => {
        response += `${index + 1}. 🎬 ${review.movieTitle} (${review.rating}⭐)\n`;
        response += `   "${review.comment.substring(0, 120)}${review.comment.length > 120 ? '...' : ''}"\n`;
        response += `   - ${review.userName} • ${this.getSentimentEmoji(review.sentiment)} ${review.sentiment}\n\n`;
      });

      response += `Want to see reviews for a specific movie or different sentiment? Just let me know! 🤔`;

      return response;

    } catch (error) {
      console.error('Error searching reviews:', error);
      return "I'm having trouble searching reviews right now. Please try again later! 🔍";
    }
  }

  // Handle greeting
  handleGreeting() {
    const greetings = [
      "Hello! 👋 I'm your movie review sentiment assistant! I can help you analyze reviews, find patterns, and discover insights about movies.",
      "Hi there! 🎬 Ready to dive into some movie review analysis? I can show you sentiment breakdowns, top-rated movies, and much more!",
      "Hey! 🤖 I'm here to help you understand what people are saying about movies. Ask me about sentiment analysis, statistics, or specific movies!"
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return `${greeting}\n\n` +
           `💡 You can ask me things like:\n` +
           `• "What's the sentiment of Avatar reviews?"\n` +
           `• "Show me the top-rated movies"\n` +
           `• "What are some negative reviews?"\n` +
           `• "Give me overall statistics"\n\n` +
           `What would you like to explore? 🎭`;
  }

  // Handle general queries (fallback)
  async handleGeneral(message) {
    const responses = [
      "I specialize in movie review sentiment analysis! 🎬 Try asking me about specific movies, overall statistics, or sentiment patterns.",
      "I can help you understand movie reviews better! 📊 Ask me about sentiment analysis, top-rated movies, or review statistics.",
      "I'm your movie sentiment expert! 🎭 I can analyze reviews, show you trends, and help you discover great movies based on community feedback.",
      "That's an interesting question! 🤔 I'm focused on movie review analysis. Try asking me about movie sentiments, ratings, or review statistics."
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return `${response}\n\n` +
           `💡 Popular questions:\n` +
           `• Movie sentiment analysis\n` +
           `• Review statistics and trends\n` +
           `• Top-rated movie recommendations\n` +
           `• Positive/negative review examples\n\n` +
           `What would you like to know? 🎬`;
  }

  // Extract movie title from user message
  extractMovieTitle(message) {
    const patterns = [
      /sentiment.*?(?:of|for)\s+["']?([^"'?\n,.!]+)["']?/i,
      /about\s+["']?([^"'?\n,.!]+)["']?/i,
      /reviews.*?(?:of|for)\s+["']?([^"'?\n,.!]+)["']?/i,
      /movie\s+["']?([^"'?\n,.!]+)["']?/i,
      /["']([^"']+)["']/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Get sentiment emoji
  getSentimentEmoji(sentiment) {
    const emojiMap = {
      'positive': '😊',
      'negative': '😞',
      'neutral': '😐'
    };
    return emojiMap[sentiment] || '🤔';
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearConversationHistory() {
    this.conversationHistory = [];
  }
}

console.log("Chatbot placeholder");

module.exports = SentimentBot;