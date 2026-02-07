import app from '../backend/src/app';
import { connectDB } from '../backend/src/config/database';

// Connect to database
connectDB();

// Vercel expects a default export of the handler
export default app;
