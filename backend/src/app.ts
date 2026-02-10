import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import logger from './utils/logger';
import healthRoutes from './routes/health.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminInviteRoutes from './routes/admin-invite.routes';
import apiRouter from './routes';
import { inviteCandidate } from './controllers/custom.controller';
import { seedDatabase } from './controllers/seed.controller';
import { authenticate, superAdminMiddleware } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: config.env === 'production'
        ? config.frontendUrl
        : true, // Allow all origins in development
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminInviteRoutes);

// Protected Routes
app.post('/api/candidates/:id/invite', authenticate, inviteCandidate);
app.get('/api/seed', authenticate, superAdminMiddleware, seedDatabase);

// Generic Resource Routes
app.use('/api', apiRouter);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: config.env === 'production' ? 'Internal server error' : err.message
    });
});

export default app;
