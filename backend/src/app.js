import express from 'express';
import cors from 'cors';
import auth from './routes/authRoutes.js';
import project from './routes/projectRoutes.js';
import task from './routes/taskRoutes.js';
import dashboard from './routes/dashboardRoutes.js';
import users from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

//  Proper CORS fix
const allowedOrigins = [
  'http://localhost:5173',
  'https://team-task-manager-efr82uxc0-dev-sonis-projects-4d08c819.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json());

// health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// routes
app.use('/api/auth', auth);
app.use('/api/projects', project);
app.use('/api/tasks', task);
app.use('/api/dashboard', dashboard);
app.use('/api/users', users);

// error handlers
app.use(notFound);
app.use(errorHandler);

export default app;