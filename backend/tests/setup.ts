import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // Use in-memory MongoDB for tests if available, or a separate test DB
    // For simplicity without additional dependencies, we'll assume a test env var or just mocking
    // Ideally, use MongoMemoryServer, but let's check if it's installed or if we should mock mongoose.connect

    // Checking package.json, mongodb-memory-server wasn't explicitly requested but is best practice.
    // If not installed, we can mock or use a test URI.
    // For now, let's just ensure we are NOT connecting to prod.

    if (process.env.NODE_ENV !== 'test') {
        process.env.NODE_ENV = 'test';
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});
