import app from './app';
import { connectDB } from './config/database';
import { config } from './config';
import logger from './utils/logger';

const startServer = async () => {
    await connectDB();

    app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });
};

startServer();
