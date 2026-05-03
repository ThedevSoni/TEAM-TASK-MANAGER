import express from 'express';
import cors from 'cors';
import auth from './routes/authRoutes.js';
import project from './routes/projectRoutes.js';
import task from './routes/taskRoutes.js';
import dashboard from './routes/dashboardRoutes.js';
import users from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app=express();

// Allow the React frontend to call this API from the configured client URL.
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Parse incoming JSON request bodies so controllers can read req.body.
app.use(express.json());

// Simple health endpoint used to confirm the backend is running.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Mount all feature route groups under /api.
app.use('/api/auth',auth);
app.use('/api/projects',project);
app.use('/api/tasks',task);
app.use('/api/dashboard', dashboard);
app.use('/api/users', users);

// Handle unknown routes first, then convert thrown errors into JSON responses.
app.use(notFound);
app.use(errorHandler);

export default app;
