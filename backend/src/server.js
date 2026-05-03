import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Starts the app after required configuration and database setup are ready.
const startServer = async () => {
  // Warn during development if a weak JWT secret is still being used.
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
    console.warn('JWT_SECRET should be changed before production deployment.');
  }

  // In production MongoDB is required; in local development the server can boot without it.
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongo_uri') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI is required in production');
    }

    console.warn('MONGO_URI is not configured. Skipping database connection for local startup.');
  } else {
    await connectDB();
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// If startup fails, log the reason and stop the process.
startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
