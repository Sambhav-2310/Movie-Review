import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RatingStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieFilter, setMovieFilter] = useState('');
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
    fetchStats();
  }, [movieFilter]);

  const handleMovieFilterChange = (e) => {
    const value = e.target.value;
    setMovieFilter(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (movieTitle) => {
    setMovieFilter(movieTitle);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getStats(movieFilter);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: '#718096' }}>📊 Unable to Load Statistics</h3>
      </div>
    );
  }

  // Prepare chart data
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [stats.overview.positive, stats.overview.neutral, stats.overview.negative],
        backgroundColor: [
          '#48bb78',
          '#ed8936',
          '#e53e3e',
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      },
    ],
  };

  const ratingData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Reviews',
        data: [1, 2, 3, 4, 5].map(rating => {
          const found = stats.ratingDistribution.find(r => r._id === rating);
          return found ? found.count : 0;
        }),
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: movieFilter ? `Statistics for "${movieFilter}"` : 'Overall Statistics'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Sentiment Distribution'
      },
    },
  };

  return (
    <div>
      {/* Filter */}
      <div className="card">
        <h2>📊 Review Analytics Dashboard</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="movieFilter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Filter by Movie (optional):
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                id="movieFilter"
                type="text"
                value={movieFilter}
                onChange={handleMovieFilterChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter movie title..."
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
            <button
              onClick={() => setMovieFilter('')}
              className="btn btn-secondary btn-small"
            >
              🔄 Clear
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.overview.total}</div>
          <div className="stat-label">Total Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.overview.averageRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.overview.positive}</div>
          <div className="stat-label">Positive Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.overview.negative}</div>
          <div className="stat-label">Negative Reviews</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="chart-container">
          <h3>📊 Rating Distribution</h3>
          <Bar data={ratingData} options={chartOptions} />
        </div>
        
        <div className="chart-container">
          <h3>🎭 Sentiment Analysis</h3>
          <Pie data={sentimentData} options={pieOptions} />
        </div>
      </div>

      {/* Sentiment Breakdown */}
      {stats.overview.total > 0 && (
        <div className="card">
          <h3>📈 Sentiment Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #c6f6d5, #9ae6b4)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22543d' }}>
                {stats.overview.total > 0 ? Math.round((stats.overview.positive / stats.overview.total) * 100) : 0}%
              </div>
              <div style={{ color: '#2f855a', fontSize: '0.875rem' }}>Positive</div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #fed7d7, #feb2b2)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😞</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#742a2a' }}>
                {stats.overview.total > 0 ? Math.round((stats.overview.negative / stats.overview.total) * 100) : 0}%
              </div>
              <div style={{ color: '#c53030', fontSize: '0.875rem' }}>Negative</div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              background: 'linear-gradient(135deg, #e2e8f0, #cbd5e0)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😐</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a5568' }}>
                {stats.overview.total > 0 ? Math.round((stats.overview.neutral / stats.overview.total) * 100) : 0}%
              </div>
              <div style={{ color: '#718096', fontSize: '0.875rem' }}>Neutral</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Movies */}
      {stats.topMovies && stats.topMovies.length > 0 && (
        <div className="card">
          <h3>🏆 Top Rated Movies</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568' }}>Movie</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>Avg Rating</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>Reviews</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>Positive %</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMovies.slice(0, 10).map((movie, index) => (
                  <tr key={movie._id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          background: '#4299e1', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: '24px', 
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </span>
                        {movie._id}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <span style={{ color: '#ffd700' }}>⭐</span>
                        <span style={{ fontWeight: 'bold' }}>{movie.averageRating}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#718096' }}>
                      {movie.reviewCount}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        background: movie.positivePercentage >= 70 ? '#c6f6d5' : movie.positivePercentage >= 40 ? '#fed7d7' : '#e2e8f0',
                        color: movie.positivePercentage >= 70 ? '#22543d' : movie.positivePercentage >= 40 ? '#742a2a' : '#4a5568',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {movie.positivePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #e6fffa, #b2f5ea)',
        border: '1px solid #81e6d9'
      }}>
        <h3 style={{ color: '#234e52' }}>🔍 Key Insights</h3>
        <div style={{ display: 'grid', gap: '1rem', color: '#2d3748' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📊</span>
            <span>
              <strong>{stats.overview.total}</strong> total reviews analyzed with an average rating of <strong>{stats.overview.averageRating}/5</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎭</span>
            <span>
              Sentiment distribution: <strong>{Math.round((stats.overview.positive / stats.overview.total) * 100)}%</strong> positive, 
              <strong> {Math.round((stats.overview.neutral / stats.overview.total) * 100)}%</strong> neutral, 
              <strong> {Math.round((stats.overview.negative / stats.overview.total) * 100)}%</strong> negative
            </span>
          </div>
          {stats.overview.averageRating >= 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🌟</span>
              <span>Excellent overall reception with high average rating!</span>
            </div>
          )}
          {stats.overview.positive > stats.overview.negative + stats.overview.neutral && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>😊</span>
              <span>Predominantly positive sentiment across all reviews</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingStats;