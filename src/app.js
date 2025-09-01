// src/app.js
import express from 'express';
import helmet from 'helmet';
import csrf from 'csurf';
import { corsMiddleware } from './config/cors.js';
import { sessionMiddleware } from './config/session.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();

app.set('trust proxy', 1); // needed behind ALB/Heroku/Render/Nginx for secure cookies

// Security & CORS/session ordering
app.use(helmet());
app.use(corsMiddleware);
app.use(sessionMiddleware);

// Body parsing AFTER session so csurf can use the session
app.use(express.json());

// Mount csurf globally (session-based; safe methods are allowed automatically)
app.use(csrf({ cookie: false }));

// Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);

// 404 & errors
app.use(notFound);
app.use(errorHandler);

export default app;
