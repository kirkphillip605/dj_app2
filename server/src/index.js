import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from the root directory relative to this file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Fallback to current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { eventRouter } from './routes/event';
import { musicRouter } from './routes/music';
const app = express();
// Use BACKEND_PORT from .env (fallback 4000)
const PORT = Number(process.env.BACKEND_PORT) || 4000;
// CORS – only allow the front‑end domain (defined in .env)
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
// Existing API routes
app.use('/api/auth-local', authRouter); // fallback for token‑based login (kept from earlier code)
app.use('/api/events', eventRouter);
app.use('/api/music', musicRouter);
// Basic health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
