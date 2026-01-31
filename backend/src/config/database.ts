import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

export const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB at ${config.mongoUri.substring(0, 20)}...`);
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('✅ MongoDB Connected successfully.');
    } catch (err: any) {
        console.error('❌ MongoDB connection error:', err.message);
        // Do not exit immediately, let the main error handler catch it or exit after timeout
        throw err;
    }
};
