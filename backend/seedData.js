const mongoose = require('mongoose');
const Review = require('./models/Review');
const sentimentService = require('./services/sentimentService');

// 50 diverse movies with different genres and years
const movies = [
  { title: "The Shawshank Redemption", year: 1994, genre: "Drama" },
  { title: "The Godfather", year: 1972, genre: "Crime" },
  { title: "The Dark Knight", year: 2008, genre: "Action" },
  { title: "Pulp Fiction", year: 1994, genre: "Crime" },
  { title: "Forrest Gump", year: 1994, genre: "Drama" },
  { title: "Inception", year: 2010, genre: "Sci-Fi" },
  { title: "The Matrix", year: 1999, genre: "Sci-Fi" },
  { title: "Goodfellas", year: 1990, genre: "Crime" },
  { title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, genre: "Fantasy" },
  { title: "Fight Club", year: 1999, genre: "Drama" },
  { title: "Star Wars: Episode V - The Empire Strikes Back", year: 1980, genre: "Sci-Fi" },
  { title: "The Lord of the Rings: The Return of the King", year: 2003, genre: "Fantasy" },
  { title: "The Godfather Part II", year: 1974, genre: "Crime" },
  { title: "The Lord of the Rings: The Two Towers", year: 2002, genre: "Fantasy" },
  { title: "The Dark Knight Rises", year: 2012, genre: "Action" },
  { title: "Interstellar", year: 2014, genre: "Sci-Fi" },
  { title: "Spirited Away", year: 2001, genre: "Animation" },
  { title: "The Lion King", year: 1994, genre: "Animation" },
  { title: "Gladiator", year: 2000, genre: "Action" },
  { title: "The Departed", year: 2006, genre: "Crime" },
  { title: "The Prestige", year: 2006, genre: "Thriller" },
  { title: "Whiplash", year: 2014, genre: "Drama" },
  { title: "Casablanca", year: 1942, genre: "Romance" },
  { title: "The Silence of the Lambs", year: 1991, genre: "Thriller" },
  { title: "Saving Private Ryan", year: 1998, genre: "War" },
  { title: "The Green Mile", year: 1999, genre: "Drama" },
  { title: "The Usual Suspects", year: 1995, genre: "Crime" },
  { title: "Se7en", year: 1995, genre: "Thriller" },
  { title: "The Sixth Sense", year: 1999, genre: "Thriller" },
  { title: "Toy Story", year: 1995, genre: "Animation" },
  { title: "Schindler's List", year: 1993, genre: "Drama" },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975, genre: "Drama" },
  { title: "The Terminator", year: 1984, genre: "Sci-Fi" },
  { title: "Back to the Future", year: 1985, genre: "Sci-Fi" },
  { title: "Raiders of the Lost Ark", year: 1981, genre: "Adventure" },
  { title: "Jaws", year: 1975, genre: "Thriller" },
  { title: "E.T. the Extra-Terrestrial", year: 1982, genre: "Sci-Fi" },
  { title: "Titanic", year: 1997, genre: "Romance" },
  { title: "Avatar", year: 2009, genre: "Sci-Fi" },
  { title: "Jurassic Park", year: 1993, genre: "Adventure" },
  { title: "The Avengers", year: 2012, genre: "Action" },
  { title: "Iron Man", year: 2008, genre: "Action" },
  { title: "Spider-Man: Into the Spider-Verse", year: 2018, genre: "Animation" },
  { title: "Black Panther", year: 2018, genre: "Action" },
  { title: "Get Out", year: 2017, genre: "Horror" },
  { title: "La La Land", year: 2016, genre: "Musical" },
  { title: "Mad Max: Fury Road", year: 2015, genre: "Action" },
  { title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy" },
  { title: "Her", year: 2013, genre: "Romance" },
  { title: "Django Unchained", year: 2012, genre: "Western" },
  { title: "The Social Network", year: 2010, genre: "Drama" }
];

// Sample user names for variety
const userNames = [
  "Alex Johnson", "Sarah Chen", "Mike Rodriguez", "Emma Thompson", "David Kim",
  "Lisa Anderson", "Chris Wilson", "Maria Garcia", "James Brown", "Anna Smith",
  "Robert Taylor", "Jennifer Lee", "Michael Davis", "Amanda White", "Daniel Martinez",
  "Jessica Miller", "Kevin Jones", "Rachel Green", "Brian Wilson", "Nicole Taylor",
  "Steven Clark", "Michelle Adams", "Ryan Murphy", "Stephanie Lewis", "Jason Walker",
  "Ashley Hall", "Brandon Young", "Megan King", "Tyler Wright", "Samantha Lopez",
  "Jordan Hill", "Brittany Scott", "Nathan Green", "Kayla Adams", "Zachary Baker",
  "Crystal Turner", "Logan Parker", "Destiny Evans", "Caleb Roberts", "Jasmine Reed",
  "Austin Cook", "Vanessa Morgan", "Ethan Bell", "Monica Cooper", "Hunter Richardson",
  "Paige Cox", "Mason Ward", "Taylor Murphy", "Blake Torres", "Jordan Peterson"
];

// Review templates for different ratings and sentiments
const reviewTemplates = {
  positive: {
    5: [
      "Absolutely incredible! This movie exceeded all my expectations. The acting, direction, and cinematography were flawless.",
      "A masterpiece! One of the best films I've ever seen. Highly recommend to everyone.",
      "Outstanding performance from start to finish. This will definitely be a classic.",
      "Brilliant storytelling and amazing visuals. Couldn't take my eyes off the screen.",
      "Perfect in every way. The plot was engaging and the characters were well-developed.",
      "Exceptional film! The emotional depth and technical execution were outstanding.",
      "A true work of art. This movie will stay with me for a long time.",
      "Fantastic! Everything about this film was top-notch. A must-watch!",
      "Incredible experience! The best movie I've seen this year.",
      "Outstanding! The attention to detail and storytelling were remarkable."
    ],
    4: [
      "Really enjoyed this movie! Great acting and an engaging story.",
      "Solid film with excellent performances. Would definitely watch again.",
      "Very good movie with strong character development and plot.",
      "Enjoyed it thoroughly! Great direction and cinematography.",
      "Well-made film with compelling storytelling. Recommended!",
      "Good movie with strong performances. Worth watching.",
      "Solid entertainment! The story was engaging and well-executed.",
      "Really liked this one! Great cast and interesting plot.",
      "Enjoyable film with good pacing and character arcs.",
      "Well-crafted movie with strong visual elements."
    ]
  },
  neutral: {
    3: [
      "Decent movie overall. Some good moments but nothing extraordinary.",
      "It was okay. The story was interesting but had some pacing issues.",
      "Average film with some highlights but also some weaknesses.",
      "Not bad, but not great either. Worth a watch if you have time.",
      "Mixed feelings about this one. Some parts were good, others not so much.",
      "Decent entertainment but nothing that really stood out to me.",
      "It was fine. The acting was good but the plot was predictable.",
      "Okay movie with some enjoyable moments. Nothing special though.",
      "Average film that had its moments but overall was just okay.",
      "Decent watch but didn't leave a lasting impression."
    ]
  },
  negative: {
    2: [
      "Disappointing. The story had potential but the execution fell flat.",
      "Not great. The pacing was off and the characters weren't well-developed.",
      "Below average. Some good ideas but poor execution overall.",
      "Could have been better. The plot was confusing and the acting was weak.",
      "Not impressed. The movie had some good moments but many flaws.",
      "Disappointing film. The story was promising but poorly executed.",
      "Not my cup of tea. The direction was confusing and the plot was weak.",
      "Could be better. Some interesting ideas but overall execution was poor.",
      "Not great. The movie had potential but failed to deliver.",
      "Disappointing. Expected more from this film."
    ],
    1: [
      "Terrible movie. Complete waste of time. Nothing worked in this film.",
      "Awful! One of the worst movies I've ever seen. Avoid at all costs.",
      "Horrible film. Poor acting, bad plot, and terrible direction.",
      "Complete disaster. Nothing about this movie was good.",
      "Worst movie ever! Terrible in every possible way.",
      "Absolutely terrible. Don't waste your time on this one.",
      "Horrible experience. The movie was a complete mess.",
      "Terrible film. Nothing redeeming about it at all.",
      "Awful movie. Complete waste of time and money.",
      "Disaster of a film. Avoid this at all costs."
    ]
  }
};

// Function to get a random element from an array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a review
function generateReview(movieTitle, userName) {
  // Randomly select rating (1-5) with weighted distribution
  const ratingWeights = [0.05, 0.1, 0.2, 0.35, 0.3]; // More 4s and 5s
  const random = Math.random();
  let rating = 1;
  let cumulativeWeight = 0;
  
  for (let i = 0; i < ratingWeights.length; i++) {
    cumulativeWeight += ratingWeights[i];
    if (random <= cumulativeWeight) {
      rating = i + 1;
      break;
    }
  }

  // Determine sentiment based on rating
  let sentiment;
  if (rating >= 4) sentiment = 'positive';
  else if (rating <= 2) sentiment = 'negative';
  else sentiment = 'neutral';

  // Get appropriate review template
  const template = reviewTemplates[sentiment][rating];
  const comment = getRandomElement(template);

  return {
    movieTitle,
    userName,
    rating,
    comment,
    sentiment,
    sentimentScore: (rating - 3) / 2 // Convert rating to -1 to 1 scale
  };
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movie-reviews', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    const reviews = [];
    const reviewsPerMovie = 12; // 12 reviews per movie (more than required 10)

    // Generate reviews for each movie
    for (const movie of movies) {
      console.log(`📝 Generating reviews for: ${movie.title}`);
      
      for (let i = 0; i < reviewsPerMovie; i++) {
        const userName = getRandomElement(userNames);
        const review = generateReview(movie.title, userName);
        reviews.push(review);
      }
    }

    // Insert all reviews
    console.log(`💾 Inserting ${reviews.length} reviews...`);
    await Review.insertMany(reviews);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${movies.length} movies with ${reviews.length} total reviews`);
    
    // Display some statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          positiveReviews: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negativeReviews: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
          neutralReviews: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log('\n📈 Database Statistics:');
      console.log(`   Total Reviews: ${stat.totalReviews}`);
      console.log(`   Average Rating: ${stat.averageRating.toFixed(2)}`);
      console.log(`   Positive Reviews: ${stat.positiveReviews} (${((stat.positiveReviews/stat.totalReviews)*100).toFixed(1)}%)`);
      console.log(`   Negative Reviews: ${stat.negativeReviews} (${((stat.negativeReviews/stat.totalReviews)*100).toFixed(1)}%)`);
      console.log(`   Neutral Reviews: ${stat.neutralReviews} (${((stat.neutralReviews/stat.totalReviews)*100).toFixed(1)}%)`);
    }

    // Show top 5 movies by average rating
    const topMovies = await Review.aggregate([
      {
        $group: {
          _id: '$movieTitle',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n🏆 Top 5 Movies by Average Rating:');
    topMovies.forEach((movie, index) => {
      console.log(`   ${index + 1}. ${movie._id} - ${movie.averageRating.toFixed(2)} (${movie.reviewCount} reviews)`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, movies, userNames, reviewTemplates };
