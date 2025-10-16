const app = require('./app');
const { testConnection, initializeDatabase, closeConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Initialize database connection
const initializeApp = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database (sync models)
    const isInitialized = await initializeDatabase();
    if (!isInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await closeConnection();
      process.exit(0);
    });
  } else {
    await closeConnection();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
let server;

const startServer = async () => {
  try {
    // Initialize database first
    await initializeApp();
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`🚀 Portfolio API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📚 API Documentation will be available at: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the application
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;