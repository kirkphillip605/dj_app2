import { PrismaClient } from '@prisma/client';
// Create a single PrismaClient instance
export const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
/**
 * Middleware that validates the JWT token and populates req.user.
 * If the token is missing or invalid, a 401 response is sent.
 */
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
