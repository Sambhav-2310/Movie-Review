# Database Seeding Guide

This guide explains how to populate the Movie Review Manager database with sample data.

## Overview

The seeding script adds:
- **50 diverse movies** from different genres and decades
- **12 reviews per movie** (600 total reviews)
- **50 different user names** for variety
- **Realistic review content** with appropriate ratings and sentiments
- **Weighted rating distribution** (more 4s and 5s, fewer 1s and 2s)

## Movies Included

The dataset includes popular movies from various genres:
- **Action**: The Dark Knight, Mad Max: Fury Road, Black Panther
- **Drama**: The Shawshank Redemption, Forrest Gump, Schindler's List
- **Sci-Fi**: Inception, The Matrix, Interstellar
- **Animation**: Spirited Away, The Lion King, Spider-Man: Into the Spider-Verse
- **Crime**: The Godfather, Pulp Fiction, Goodfellas
- **And many more...**

## Running the Seeding Script

### Prerequisites
1. Make sure MongoDB is running on your system
2. Install dependencies: `npm install`

### Method 1: Using npm script (Recommended)
```bash
cd backend
npm run seed
```

### Method 2: Direct execution
```bash
cd backend
node seedData.js
```

### Method 3: Using the wrapper script
```bash
cd backend
node seed.js
```

## What the Script Does

1. **Connects to MongoDB** (default: `mongodb://localhost:27017/movie-reviews`)
2. **Clears existing reviews** to start fresh
3. **Generates 12 reviews per movie** with:
   - Random user names from a pool of 50
   - Weighted rating distribution (more positive reviews)
   - Appropriate sentiment analysis based on rating
   - Realistic review comments
4. **Displays statistics** after completion

## Sample Statistics

After seeding, you'll see output like:
```
📊 Seeded 50 movies with 600 total reviews
📈 Database Statistics:
   Total Reviews: 600
   Average Rating: 3.7
   Positive Reviews: 360 (60.0%)
   Negative Reviews: 60 (10.0%)
   Neutral Reviews: 180 (30.0%)

🏆 Top 5 Movies by Average Rating:
   1. The Shawshank Redemption - 4.8 (12 reviews)
   2. The Godfather - 4.7 (12 reviews)
   3. The Dark Knight - 4.6 (12 reviews)
   ...
```

## Customization

You can modify the seeding data by editing `seedData.js`:

- **Add more movies**: Add entries to the `movies` array
- **Change review count**: Modify `reviewsPerMovie` variable
- **Add user names**: Add entries to the `userNames` array
- **Customize review templates**: Modify the `reviewTemplates` object
- **Adjust rating distribution**: Change the `ratingWeights` array

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in `config/db.js`
- Verify MongoDB is accessible on the default port (27017)

### Permission Issues
- Make sure you have write permissions to the database
- Check if the database exists and is accessible

### Memory Issues
- The script inserts all reviews at once, which should work fine for 600 reviews
- If you encounter memory issues, consider batching the inserts

## Verification

After seeding, you can verify the data by:

1. **Starting the server**: `npm start`
2. **Checking the API**: Visit `http://localhost:5000/api/health`
3. **Viewing reviews**: `http://localhost:5000/api/reviews`
4. **Checking statistics**: `http://localhost:5000/api/reviews/stats`

## Resetting the Database

To clear all data and start fresh:
```bash
# Connect to MongoDB shell
mongo movie-reviews

# Clear all reviews
db.reviews.deleteMany({})

# Exit MongoDB shell
exit
```

Then run the seeding script again.
