import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI, reviewAPI } from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your movie review sentiment assistant. I can help you analyze reviews, find sentiment patterns, and get insights about movies. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Process the message and generate response
      const response = await processMessage(inputMessage);
      
      const botMessage = {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error while processing your request. Please try again! 😅",
        isBot: true,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    try {
      // Check if user is asking about specific movie sentiment
      if (lowerMessage.includes('sentiment') && (lowerMessage.includes('of') || lowerMessage.includes('for'))) {
        const movieMatch = extractMovieTitle(message);
        if (movieMatch) {
          const stats = await reviewAPI.getStats(movieMatch);
          const data = stats.data.data.overview;
          
          if (data.total === 0) {
            return `I couldn't find any reviews for "${movieMatch}". Try searching for a different movie! 🎬`;
          }
          
          const positivePercent = Math.round((data.positive / data.total) * 100);
          const negativePercent = Math.round((data.negative / data.total) * 100);
          const neutralPercent = Math.round((data.neutral / data.total) * 100);
          
          return `Here's the sentiment analysis for "${movieMatch}" 🎭:\n\n` +
                 `📊 Total Reviews: ${data.total}\n` +
                 `😊 Positive: ${data.positive} (${positivePercent}%)\n` +
                 `😐 Neutral: ${data.neutral} (${neutralPercent}%)\n` +
                 `😞 Negative: ${data.negative} (${negativePercent}%)\n` +
                 `⭐ Average Rating: ${data.averageRating}/5\n\n` +
                 `Overall sentiment is ${positivePercent > 50 ? 'mostly positive! 🌟' : negativePercent > 50 ? 'mostly negative 📉' : 'mixed 🎭'}`;
        }
      }
      
      // Check for general stats request
      if (lowerMessage.includes('stats') || lowerMessage.includes('statistics') || lowerMessage.includes('overview')) {
        const stats = await reviewAPI.getStats();
        const data = stats.data.data.overview;
        
        const positivePercent = Math.round((data.positive / data.total) * 100);
        const negativePercent = Math.round((data.negative / data.total) * 100);
        const neutralPercent = Math.round((data.neutral / data.total) * 100);
        
        return `Here are the overall review statistics! 📊\n\n` +
               `🎬 Total Reviews: ${data.total}\n` +
               `⭐ Average Rating: ${data.averageRating}/5\n\n` +
               `Sentiment Breakdown:\n` +
               `😊 Positive: ${data.positive} reviews (${positivePercent}%)\n` +
               `😐 Neutral: ${data.neutral} reviews (${neutralPercent}%)\n` +
               `😞 Negative: ${data.negative} reviews (${negativePercent}%)\n\n` +
               `The community sentiment is ${positivePercent > 50 ? 'overwhelmingly positive! 🎉' : 'quite mixed 🎭'}`;
      }
      
      // Check for top movies request
      if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('highest rated')) {
        const stats = await reviewAPI.getStats();
        const topMovies = stats.data.data.topMovies.slice(0, 5);
        
        if (topMovies.length === 0) {
          return "I don't have enough data to show top-rated movies yet. Add some reviews to get started! 🎬";
        }
        
        let response = "Here are the top-rated movies! 🏆\n\n";
        topMovies.forEach((movie, index) => {
          response += `${index + 1}. ${movie._id}\n`;
          response += `   ⭐ ${movie.averageRating}/5 (${movie.reviewCount} reviews)\n`;
          response += `   😊 ${movie.positivePercentage}% positive sentiment\n\n`;
        });
        
        return response + "Want to know more about any specific movie? Just ask! 🎭";
      }
      
      // Check for negative reviews request
      if (lowerMessage.includes('negative') || lowerMessage.includes('bad') || lowerMessage.includes('worst')) {
        const reviewsResponse = await reviewAPI.getReviews({ sentiment: 'negative', limit: 3 });
        const negativeReviews = reviewsResponse.data.data;
        
        if (negativeReviews.length === 0) {
          return "Great news! I couldn't find any negative reviews. All movies seem to be well-received! 😊";
        }
        
    let response = "Here are some recent negative reviews 😞:\n\n";
    negativeReviews.forEach((review, index) => {
      response += `${index + 1}. ${review.movieTitle} (${review.rating}⭐)\n`;
      response += `   "${review.comment.substring(0, 100)}${review.comment.length > 100 ? '...' : ''}"\n`;
      response += `   - ${review.userName}\n\n`;
    });

        return response + "Would you like to see reviews for a specific movie? 🎬";
      }
      
      // Check for positive reviews request
      if (lowerMessage.includes('positive') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
        const reviewsResponse = await reviewAPI.getReviews({ sentiment: 'positive', limit: 3 });
        const positiveReviews = reviewsResponse.data.data;
        
        if (positiveReviews.length === 0) {
          return "I couldn't find any positive reviews yet. Be the first to add one! 🌟";
        }
        
        let response = "Here are some recent positive reviews 😊:\n\n";
        positiveReviews.forEach((review, index) => {
          response += `${index + 1}. ${review.movieTitle} (${review.rating}⭐)\n`;
          response += `   "${review.comment.substring(0, 100)}${review.comment.length > 100 ? '...' : ''}"\n`;
          response += `   - ${review.userName}\n\n`;
        });
        
        return response + "These movies are definitely worth watching! 🎉";
      }
      
      // Search for specific movie
      if (lowerMessage.includes('movie') && (lowerMessage.includes('about') || lowerMessage.includes('tell me'))) {
        const movieMatch = extractMovieTitle(message);
        if (movieMatch) {
          const reviewsResponse = await reviewAPI.getReviews({ movieTitle: movieMatch, limit: 5 });
          const reviews = reviewsResponse.data.data;
          
          if (reviews.length === 0) {
            return `I couldn't find any reviews for "${movieMatch}". Would you like to add the first review? 🎬`;
          }
          
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          const sentiments = reviews.reduce((acc, r) => {
            acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
            return acc;
          }, {});
          
          let response = `Here's what I found about "${movieMatch}" 🎭:\n\n`;
          response += `📊 ${reviews.length} reviews found\n`;
          response += `⭐ Average Rating: ${avgRating.toFixed(1)}/5\n\n`;
          response += `Sentiment Breakdown:\n`;
          if (sentiments.positive) response += `😊 Positive: ${sentiments.positive}\n`;
          if (sentiments.neutral) response += `😐 Neutral: ${sentiments.neutral}\n`;
          if (sentiments.negative) response += `😞 Negative: ${sentiments.negative}\n\n`;
          
          response += `Recent review: "${reviews[0].comment.substring(0, 120)}${reviews[0].comment.length > 120 ? '...' : ''}"\n`;
          response += `- ${reviews[0].userName} (${reviews[0].rating}⭐)`;
          
          return response;
        }
      }
      
      // Fallback to simulated response
      return await chatbotAPI.sendMessage(message).then(res => res.data.response);
      
    } catch (error) {
      console.error('Error processing message:', error);
      return "I'm having trouble accessing the review data right now. Please try again later! 🤖";
    }
  };

  const extractMovieTitle = (message) => {
    // Simple extraction - look for movie titles after common patterns
    const patterns = [
      /sentiment.*?(?:of|for)\s+["']?([^"'?\n]+)["']?/i,
      /about\s+["']?([^"'?\n]+)["']?/i,
      /reviews.*?(?:of|for)\s+["']?([^"'?\n]+)["']?/i,
      /["']([^"']+)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestedQuestions = [
    "What's the overall sentiment of reviews?",
    "Show me the top-rated movies",
    "What are some negative reviews saying?",
    "Tell me about Avatar reviews",
    "What's the current statistics?"
  ];

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🤖 Sentiment Bot</span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{message.text}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  opacity: 0.7, 
                  marginTop: '0.25rem' 
                }}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
                  Bot is typing...
                </div>
              </div>
            )}
            
            {messages.length === 1 && (
              <div style={{ padding: '1rem 0', borderTop: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.5rem' }}>
                  Try asking:
                </div>
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(question);
                      handleSendMessage();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem',
                      margin: '0.25rem 0',
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      color: '#4a5568'
                    }}
                  >
                    💬 {question}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about movie sentiments..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              📤
            </button>
          </div>
        </div>
      )}
      
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Sentiment Bot"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
};

export default ChatBot;