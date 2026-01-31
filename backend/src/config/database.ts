import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

export const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB at ${config.mongoUri.substring(0, 20)}...`);
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if no connection
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB Connected...');
    } catch (err: any) {
        logger.error('MongoDB connection error: ' + err.message);
        process.exit(1);
    }
};
