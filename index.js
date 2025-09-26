// Root entry point to satisfy package.json "main": "index.js"
// Delegates to the backend server so tools importing the package have a valid entry.

/* eslint-disable no-console */
try {
  // This will start the Express server immediately as backend/server.js calls app.listen
  require('./backend/server');
  console.log('Bootstrapped backend from index.js');
} catch (error) {
  console.error('Failed to start backend from index.js:', error);
  process.exit(1);
}


