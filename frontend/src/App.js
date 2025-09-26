import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ReviewForm from './components/ReviewForm';
import ReviewList from './components/ReviewList';
import RatingStats from './components/RatingStats';
import ChatBot from './components/ChatBot';
import './styles/main.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'add':
        return <ReviewForm onReviewAdded={refreshData} />;
      case 'stats':
        return <RatingStats key={refreshTrigger} />;
      default:
        return <ReviewList key={refreshTrigger} onReviewUpdated={refreshData} />;
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="container">
          <h1>🎬 Movie Review Manager</h1>
          <p>Analyze customer reviews with AI-powered sentiment analysis</p>
          
          <nav className="nav">
            <button
              className={`nav-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              📝 Reviews
            </button>
            <button
              className={`nav-button ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              ➕ Add Review
            </button>
            <button
              className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Analytics
            </button>
          </nav>
        </div>
      </div>

      <div className="container">
        {renderActiveTab()}
      </div>

      <ChatBot />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
export default App;
