import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production');
}

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/talentmatch',
    jwtSecret: jwtSecret || 'dev-only-secret-do-not-use-in-prod',
    env: process.env.NODE_ENV || 'development',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    publicEmailDomains: [
        'gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'live.com',
        'yahoo.com', 'yahoo.co.uk', 'ymail.com', 'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'protonmail.com', 'proton.me', 'mail.com', 'zoho.com',
        'gmx.com', 'gmx.net', 'yandex.com', 'tutanota.com'
    ],
};
