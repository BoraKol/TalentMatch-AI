import app from './app';
import { connectDB } from './config/database';
import { config } from './config';
import logger from './utils/logger';

console.log('✅ Index.ts loaded, starting initialization...');

const startServer = async () => {
    try {
        logger.info('Starting server initialization...');

        logger.info('Connecting to Database...');
        await connectDB();
        logger.info('Database connected successfully.');

        app.listen(Number(config.port), '0.0.0.0', () => {
            logger.info(`Server running on port ${config.port} in ${config.env} mode`);
            logger.info(`Health check available at http://0.0.0.0:${config.port}/api/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
