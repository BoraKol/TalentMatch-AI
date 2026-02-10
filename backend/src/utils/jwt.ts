import jwt from 'jsonwebtoken';
import { config } from '../config';

export function generateToken(payload: { id: any; email: string; role: string }): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
}
