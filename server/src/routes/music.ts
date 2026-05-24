import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const musicRouter = Router();

// Cache for Spotify API Access Token
let spotifyAccessToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_spotify_client_id') {
    console.warn('⚠️ Spotify credentials are not configured in .env');
    return null;
  }

  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Failed to get Spotify access token:', errorText);
      return null;
    }

    const data = (await resp.json()) as { access_token: string; expires_in: number };
    spotifyAccessToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyAccessToken;
  } catch (err) {
    console.error('Error fetching Spotify access token:', err);
    return null;
  }
}

// 1. Spotify fallback search endpoint
musicRouter.get('/search', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const token = await getSpotifyAccessToken();
  if (!token) {
    return res.status(500).json({ error: 'Spotify API credentials not configured or authorization failed' });
  }

  try {
    const resp = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Spotify search failed:', errorText);
      return res.status(resp.status).json({ error: 'Spotify search failed' });
    }

    const data = (await resp.json()) as any;
    const tracks = (data.tracks?.items || []).map((t: any) => ({
      id: t.id,
      title: t.name,
      artistName: t.artists.map((a: any) => a.name).join(', '),
      albumName: t.album.name,
      artworkUrl: t.album.images[0]?.url ?? '',
      sourceService: 'Spotify',
      externalTrackId: t.id,
    }));

    res.json(tracks);
  } catch (err) {
    console.error('Error performing Spotify search:', err);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

// 2. Add a track to a bucket
const trackSchema = z.object({
  bucketId: z.string(),
  title: z.string(),
  artistName: z.string(),
  albumName: z.string(),
  artworkUrl: z.string().optional(),
  sourceService: z.enum(['Spotify', 'Apple', 'Tidal']),
  externalTrackId: z.string(),
});

musicRouter.post('/track', async (req, res) => {
  const parse = trackSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;

  const bucket = await prisma.musicBucket.findUnique({
    where: { id: data.bucketId },
  });
  if (!bucket) return res.status(404).json({ error: 'Bucket not found' });

  const track = await prisma.track.create({
    data: {
      bucketId: data.bucketId,
      title: data.title,
      artistName: data.artistName,
      albumName: data.albumName,
      artworkUrl: data.artworkUrl || '',
      sourceService: data.sourceService,
      externalTrackId: data.externalTrackId,
      position: (await prisma.track.count({ where: { bucketId: data.bucketId } })) + 1,
    },
  });

  res.status(201).json(track);
});

// 3. Delete a track
musicRouter.delete('/track/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.track.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

// 4. Update bucket notes
const notesSchema = z.object({
  bucketId: z.string(),
  notes: z.string(),
});

musicRouter.patch('/bucket/notes', async (req, res) => {
  const parse = notesSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const { bucketId, notes } = parse.data;

  const bucket = await prisma.musicBucket.findUnique({
    where: { id: bucketId },
  });
  if (!bucket) return res.status(404).json({ error: 'Bucket not found' });

  const updated = await prisma.musicBucket.update({
    where: { id: bucketId },
    data: { notes },
  });
  res.json(updated);
});

// 5. Get bucket details (like notes)
musicRouter.get('/bucket/:id', async (req, res) => {
  const { id } = req.params;
  const bucket = await prisma.musicBucket.findUnique({
    where: { id },
  });
  if (!bucket) return res.status(404).json({ error: 'Bucket not found' });
  res.json(bucket);
});

// 6. Get tracks for a public bucket
musicRouter.get('/bucket/:id/tracks', async (req, res) => {
  const { id } = req.params;
  const tracks = await prisma.track.findMany({
    where: { bucketId: id },
    orderBy: { position: 'asc' },
  });
  res.json(tracks);
});
