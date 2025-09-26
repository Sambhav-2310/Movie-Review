# 🎬 Movie Review Manager

A full-stack web application for managing movie reviews with sentiment analysis, built with React, Node.js, Express, and MongoDB.

## ✨ Features

- **📝 Review Management**: Add, edit, delete, and view movie reviews
- **🎯 Sentiment Analysis**: Automatic sentiment analysis of review comments
- **📊 Analytics Dashboard**: Visual statistics and charts for review data
- **🔍 Smart Search**: Advanced movie filtering with autocomplete suggestions
- **🤖 AI Chatbot**: Interactive chatbot for movie recommendations and statistics
- **📱 Responsive Design**: Modern, mobile-friendly interface
- **⚡ Real-time Updates**: Live data updates and filtering

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Chart.js** - Data visualization
- **React Toastify** - Notifications
- **CSS3** - Styling with modern features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client

### Additional Tools
- **Sentiment Analysis** - Custom sentiment scoring
- **Debounced Search** - Optimized search performance
- **RESTful API** - Clean API design

## 📁 Project Structure

```
movie-review-manager/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   └── reviewController.js # Review API endpoints
│   ├── models/
│   │   └── Review.js          # Review data model
│   ├── routes/
│   │   └── reviewRoutes.js    # API routes
│   ├── services/
│   │   └── sentimentService.js # Sentiment analysis
│   ├── seedData.js            # Database seeding script
│   ├── seed.js                # Seeding wrapper
│   ├── server.js              # Express server
│   └── package.json           # Backend dependencies
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.js     # AI chatbot component
│   │   │   ├── RatingStats.js # Analytics dashboard
│   │   │   ├── ReviewForm.js  # Review creation form
│   │   │   └── ReviewList.js  # Reviews display
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── styles/
│   │   │   └── main.css       # Global styles
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   └── package.json           # Frontend dependencies
├── chatbot/
│   └── sentimentBot.js        # Chatbot logic
├── docs/
│   └── README.md              # Documentation
└── README.md                  # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd movie-review-manager
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/movie-reviews
PORT=5000
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Run the seeding script:
```bash
cd backend
node seedData.js
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a cluster and get connection string
3. Update `.env` file with your connection string
4. Run the seeding script

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm start
# or for development
npm run dev
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Database Seeding

The project includes a comprehensive seeding script that populates the database with:

- **50 diverse movies** from different genres and decades
- **600+ reviews** (12 reviews per movie)
- **50 different user names** for variety
- **Realistic review content** with appropriate ratings and sentiments

### Run Seeding
```bash
cd backend
npm run seed
# or
node seedData.js
```

## 🔧 API Endpoints

### Reviews
- `GET /api/reviews` - Get all reviews with filtering
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/search` - Search movies

### Health Check
- `GET /api/health` - API health status

## 🎯 Key Features Explained

### Smart Search & Filtering
- **Debounced search**: Prevents excessive API calls while typing
- **Autocomplete suggestions**: Real-time movie suggestions
- **Word boundary matching**: More accurate search results
- **Multiple filters**: Search by movie, sentiment, rating range

### Sentiment Analysis
- **Automatic analysis**: Reviews are analyzed when created/updated
- **Sentiment scoring**: Numerical score from -1 (negative) to 1 (positive)
- **Visual indicators**: Emoji and color-coded sentiment display

### Analytics Dashboard
- **Rating distribution**: Bar chart showing rating frequencies
- **Sentiment breakdown**: Pie chart of sentiment distribution
- **Movie statistics**: Top movies by rating and review count
- **Filtered analytics**: Statistics for specific movies

### AI Chatbot
- **Interactive interface**: Floating chat widget
- **Movie recommendations**: Get suggestions based on preferences
- **Statistics queries**: Ask about review data
- **Natural language**: Conversational interface

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy with Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy build folder to hosting service
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Chart.js for beautiful visualizations
- All open-source contributors

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue
4. Contact the maintainers

---

**Happy Reviewing! 🎬✨**
