import { Router } from 'express';
import { PrismaClient, BucketType } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();
export const eventRouter = Router();

// Get event by unique code (public endpoint, no auth)
eventRouter.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  const event = await prisma.event.findUnique({
    where: { uniqueCode: code },
    include: { buckets: true },
  });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

eventRouter.use(requireAuth);

// Create new event and generate unique code
const createSchema = z.object({
  eventName: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

eventRouter.post('/', async (req: AuthRequest, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const { eventName, contactName, phone, email } = parse.data;

  const event = await prisma.event.create({
    data: {
      eventName,
      contactName,
      phone,
      email,
      userId: req.user!.id,
      buckets: {
        create: [
          { bucketType: BucketType.ceremony },
          { bucketType: BucketType.reception },
          { bucketType: BucketType.do_not_play },
        ],
      },
    },
    include: { buckets: true },
  });

  res.status(201).json(event);
});

// List DJ's events (protected)
eventRouter.get('/', async (req: AuthRequest, res) => {
  const events = await prisma.event.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(events);
});
