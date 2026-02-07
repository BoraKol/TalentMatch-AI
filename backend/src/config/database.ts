import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

let cachedConnection: typeof mongoose | null = null;

export const connectDB = async () => {
    if (cachedConnection) {
        console.log('✅ Using cached MongoDB connection.');
        return cachedConnection;
    }

    try {
        console.log(`Connecting to MongoDB at ${config.mongoUri.substring(0, 20)}...`);
        cachedConnection = await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('✅ MongoDB Connected successfully.');
        return cachedConnection;
    } catch (err: any) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
};
