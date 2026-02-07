import app from '../backend/src/app';
import { connectDB } from '../backend/src/config/database';

// Vercel Serverless Function Handler
export default async (req: any, res: any) => {
    await connectDB();
    return app(req, res);
};
