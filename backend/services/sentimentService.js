const axios = require('axios');

class SentimentService {
  constructor() {
    // Simple rule-based keywords for fallback
    this.positiveWords = [
      'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'love', 'wonderful',
      'brilliant', 'outstanding', 'perfect', 'incredible', 'superb', 'magnificent',
      'delightful', 'impressive', 'remarkable', 'phenomenal', 'spectacular',
      'good', 'nice', 'beautiful', 'enjoyed', 'liked', 'recommend', 'best'
    ];
    
    this.negativeWords = [
      'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'disappointing',
      'boring', 'stupid', 'waste', 'failed', 'poor', 'pathetic', 'ridiculous',
      'annoying', 'frustrating', 'useless', 'painful', 'disaster', 'mess',
      'terrible', 'disgusting', 'unbearable', 'nightmare'
    ];
  }

  // Rule-based sentiment analysis (fallback method)
  analyzeRuleBased(text) {
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });

    const totalWords = words.length;
    const positiveScore = positiveCount / totalWords;
    const negativeScore = negativeCount / totalWords;
    
    let sentiment = 'neutral';
    let score = 0;

    if (positiveScore > negativeScore && positiveScore > 0.05) {
      sentiment = 'positive';
      score = Math.min(positiveScore * 2, 1);
    } else if (negativeScore > positiveScore && negativeScore > 0.05) {
      sentiment = 'negative';
      score = Math.max(-negativeScore * 2, -1);
    } else {
      score = (positiveScore - negativeScore) * 0.5;
    }

    return { sentiment, score: Math.round(score * 100) / 100 };
  }

  // HuggingFace API sentiment analysis
  async analyzeHuggingFace(text) {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[0]) {
        const results = response.data[0];
        const topResult = results.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        );

        let sentiment = 'neutral';
        let score = 0;

        // Map HuggingFace labels to our format
        switch(topResult.label) {
          case 'LABEL_2': // Positive
            sentiment = 'positive';
            score = topResult.score;
            break;
          case 'LABEL_0': // Negative
            sentiment = 'negative';
            score = -topResult.score;
            break;
          case 'LABEL_1': // Neutral
            sentiment = 'neutral';
            score = 0;
            break;
        }

        return { 
          sentiment, 
          score: Math.round(score * 100) / 100,
          confidence: Math.round(topResult.score * 100) / 100
        };
      }
    } catch (error) {
      console.warn('HuggingFace API error:', error.message);
      return null;
    }
  }

  // Main sentiment analysis method
  async analyzeSentiment(text, rating = null) {
    if (!text || text.trim().length === 0) {
      return { sentiment: 'neutral', score: 0 };
    }

    let result = null;

    // Try HuggingFace API first if API key is available
    if (process.env.HUGGINGFACE_API_KEY) {
      result = await this.analyzeHuggingFace(text);
    }

    // Fallback to rule-based analysis
    if (!result) {
      result = this.analyzeRuleBased(text);
    }

    // Adjust sentiment based on rating if provided
    if (rating !== null) {
      if (rating >= 4 && result.sentiment === 'negative') {
        result.sentiment = 'neutral';
        result.score = Math.max(result.score, 0);
      } else if (rating <= 2 && result.sentiment === 'positive') {
        result.sentiment = 'neutral';
        result.score = Math.min(result.score, 0);
      }
    }

    return result;
  }

  // Batch analyze multiple texts
  async analyzeBatch(texts) {
    const promises = texts.map(text => this.analyzeSentiment(text));
    return Promise.all(promises);
  }

  // Get sentiment statistics
  calculateSentimentStats(reviews) {
    const stats = {
      total: reviews.length,
      positive: 0,
      negative: 0,
      neutral: 0,
      averageRating: 0,
      averageSentimentScore: 0
    };

    if (reviews.length === 0) return stats;

    let totalRating = 0;
    let totalSentimentScore = 0;

    reviews.forEach(review => {
      stats[review.sentiment]++;
      totalRating += review.rating;
      totalSentimentScore += review.sentimentScore || 0;
    });

    stats.averageRating = Math.round((totalRating / reviews.length) * 100) / 100;
    stats.averageSentimentScore = Math.round((totalSentimentScore / reviews.length) * 100) / 100;

    return stats;
  }
}

module.exports = new SentimentService();