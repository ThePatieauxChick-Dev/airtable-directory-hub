import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  console.log('🔑 AIRTABLE_API_KEY loaded:', !!process.env.AIRTABLE_API_KEY);
}

import express from 'express';
import multer from 'multer';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

// ─── Simple in-memory cache ────────────────────────────────────────────────
interface CacheEntry {
  data: any;
  expires: number;
}

const cache: Record<string, CacheEntry> = {};

function getCached(key: string): any | null {
  const entry = cache[key];
  if (entry && entry.expires > Date.now()) return entry.data;
  return null;
}

function setCached(key: string, data: any, ttlSeconds: number = 300) {
  cache[key] = { data, expires: Date.now() + ttlSeconds * 1000 };
}

// ─── Multer setup ──────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

// ─── Upload image to imgbb, return public URL ──────────────────────────────
// Get a free API key at https://api.imgbb.com (takes 30 seconds)
// Add IMGBB_API_KEY to your .env and Vercel environment variables
async function uploadToImgbb(file: Express.Multer.File): Promise<string> {
  const IMGBB_API_KEY = getRequiredEnv('IMGBB_API_KEY');
  const base64 = file.buffer.toString('base64');

  const body = new URLSearchParams();
  body.append('key', IMGBB_API_KEY);
  body.append('image', base64);
  body.append('name', file.originalname || 'image');

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`imgbb upload failed: ${err}`);
  }

  const data = await res.json();
  return data.data.url as string;
}

// ─── GET /api/listings (with 5-min cache) ─────────────────────────────────
app.get('/api/listings', async (_req, res) => {
  const cacheKey = 'listings_active';
  const cached = getCached(cacheKey);
  if (cached) {
    console.log('📦 Serving listings from cache');
    return res.json(cached);
  }

  try {
    const AIRTABLE_API_KEY = getRequiredEnv('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = getRequiredEnv('AIRTABLE_BASE_ID');
    const AIRTABLE_TABLE_ID = getRequiredEnv('AIRTABLE_TABLE_ID');

    const allRecords: unknown[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({ filterByFormula: `{Status} = "Active"` });
      if (offset) params.set('offset', offset);

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Airtable API error [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();
      if (Array.isArray(data.records)) allRecords.push(...data.records);
      offset = typeof data.offset === 'string' ? data.offset : undefined;
    } while (offset);

    const responseData = { records: allRecords };
    setCached(cacheKey, responseData, 300);
    res.json(responseData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching listings:', message);
    res.status(500).json({ error: message });
  }
});

// ─── POST /api/submit-listing ──────────────────────────────────────────────
app.post(
  '/api/submit-listing',
  (req, res, next) => {
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'headshot', maxCount: 1 },
    ])(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 4 MB.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const AIRTABLE_API_KEY = getRequiredEnv('AIRTABLE_API_KEY');
      const AIRTABLE_BASE_ID = getRequiredEnv('AIRTABLE_BASE_ID');
      const AIRTABLE_TABLE_ID = getRequiredEnv('AIRTABLE_TABLE_ID');

      const {
        fullName,
        phone,
        email,
        cityAndState,
        country,
        shortBio,
        category,
        businessName,
        whatOffer,
        website,
        socialMedia,
        personalCategory,
      } = req.body;

      if (!fullName || !email || !cityAndState || !country || !businessName || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Upload images to imgbb first to get public URLs for Airtable
      const photoFile = files?.['photo']?.[0];
      const headshotFile = files?.['headshot']?.[0];

      const [photoUrl, headshotUrl] = await Promise.all([
        photoFile ? uploadToImgbb(photoFile) : Promise.resolve(null),
        headshotFile ? uploadToImgbb(headshotFile) : Promise.resolve(null),
      ]);

      // Build Airtable fields
      const fields: Record<string, unknown> = {
        'Full Name': String(fullName).slice(0, 200),
        Email: String(email).slice(0, 500),
        'City and State': String(cityAndState).slice(0, 200),
        Country: String(country).slice(0, 200),
        'Business Name': String(businessName).slice(0, 200),
        Category: [String(category).slice(0, 100)],
        Status: 'Pending',
        'Date Submitted': new Date().toISOString().split('T')[0],
      };

      if (phone) fields['Phone'] = String(phone).slice(0, 50);
      if (shortBio) fields['Short Bio'] = String(shortBio).slice(0, 2000);
      if (whatOffer) fields['What Do You Offer'] = String(whatOffer).slice(0, 2000);
      if (website) fields['Website or Booking Link'] = String(website).slice(0, 500);
      if (socialMedia) fields['Social Media Link (Instagram Preferred)'] = String(socialMedia).slice(0, 200);

      // Airtable accepts { url, filename } objects for attachment fields
      if (photoUrl) fields['Photo'] = [{ url: photoUrl, filename: photoFile!.originalname || 'photo.jpg' }];
      if (headshotUrl) fields['Headshot'] = [{ url: headshotUrl, filename: headshotFile!.originalname || 'headshot.jpg' }];

      const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields, typecast: true }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        console.error('Airtable create error:', errorBody);
        throw new Error(`Airtable API error [${createResponse.status}]: ${errorBody}`);
      }

      const result = await createResponse.json();
      const recordId = result.id as string;
      console.log('✅ Created Airtable record:', recordId);

      // Save personal category to "Niche" field (non-fatal)
      if (personalCategory) {
        try {
          const patchRes = await fetch(`${createUrl}/${recordId}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields: { Niche: String(personalCategory) }, typecast: true }),
          });
          if (!patchRes.ok) {
            const patchErr = await patchRes.text();
            console.warn('Personal category save (non-fatal):', patchErr);
          }
        } catch {
          console.warn('Could not save personal category (non-fatal)');
        }
      }

      res.json({ success: true, id: recordId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting listing:', message);
      res.status(500).json({ error: message });
    }
  }
);

// ─── GET /api/get-categories ───────────────────────────────────────────────
app.get('/api/get-categories', async (_req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = getRequiredEnv('AIRTABLE_BASE_ID');
    const AIRTABLE_TABLE_ID = getRequiredEnv('AIRTABLE_TABLE_ID');

    const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) throw new Error(`Airtable metadata error: ${response.status}`);

    const data = await response.json();
    const table = data.tables?.find((t: any) => t.id === AIRTABLE_TABLE_ID);
    const categoryField = table?.fields?.find((f: any) => f.name === 'Category');

    if (categoryField?.options?.choices) {
      const categories = categoryField.options.choices.map((c: any) => c.name);
      return res.json({ categories });
    }

    res.json({ categories: [] });
  } catch (error) {
    console.warn('Could not fetch categories from Airtable, using fallback list');
    res.json({ categories: [] });
  }
});

// ─── Serve Frontend (production only) ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.use('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start server (local dev only) ────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;