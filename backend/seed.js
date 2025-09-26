#!/usr/bin/env node

/**
 * Movie Review Database Seeding Script
 * 
 * This script populates the database with 50 movies and 12 reviews per movie
 * (600 total reviews) with diverse ratings and sentiments.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   node seed.js
 */

const { seedDatabase } = require('./seedData');

console.log('🎬 Movie Review Manager - Database Seeder');
console.log('==========================================\n');

// Run the seeding process
seedDatabase().then(() => {
  console.log('\n🎉 Seeding process completed!');
  console.log('You can now start the server with: npm start');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Seeding failed:', error.message);
  process.exit(1);
});
