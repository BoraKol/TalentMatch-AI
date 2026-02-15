import rateLimit from 'express-rate-limit';

// Auth endpoints: strict limit to prevent brute-force
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes (login, register)
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset: very strict to prevent code enumeration
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per 15 minutes
    message: {
        success: false,
        error: 'Too many password reset attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API: moderate limit
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300,
    message: {
        success: false,
        error: 'Too many requests, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
