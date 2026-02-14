import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from './config';
import logger from './utils/logger';
import apiRouter from './routes';
import { authRateLimiter, apiRateLimiter } from './middleware/rate-limit.middleware';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: config.env === 'production' ? config.frontendUrl : true,
    credentials: true
}));
app.use(cookieParser());
app.use(mongoSanitize());

// Swagger UI
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate Limiting
app.use('/api/', apiRateLimiter);
app.use('/api/auth/', authRateLimiter);

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Centralized API Routes
app.use('/api', apiRouter);

// Global Error Handling
app.use(errorHandler);

export default app;
