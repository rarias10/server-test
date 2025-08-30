// src/app.js
import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './config/cors.js';
import { sessionMiddleware } from './config/session.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();

app.set('trust proxy', 1); // needed behind ALB/Heroku/Render/Nginx for secure cookies

// Security & basics
app.use(helmet());
app.use(express.json());

// CORS & sessions
app.use(corsMiddleware);
app.use(sessionMiddleware);

// Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);

// 404 & errors
app.use(notFound);
app.use(errorHandler);

export default app;
