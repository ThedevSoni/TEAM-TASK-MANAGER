import express from 'express';
import cors from 'cors';
import auth from './routes/authRoutes.js';
import project from './routes/projectRoutes.js';
import task from './routes/taskRoutes.js';
import dashboard from './routes/dashboardRoutes.js';
import users from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// ✅ FINAL CORS FIX (dynamic - works for all Vercel domains)
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', auth);
app.use('/api/projects', project);
app.use('/api/tasks', task);
app.use('/api/dashboard', dashboard);
app.use('/api/users', users);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;