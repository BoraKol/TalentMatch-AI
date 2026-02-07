import app from '../src/app';
import { connectDB } from '../src/config/database';

// Connect to database
connectDB();

// Vercel expects a default export of the handler
export default app;
