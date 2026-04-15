import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Load environment variables from .env file (local development only) ───────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Optional: log whether the key was loaded (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔑 AIRTABLE_API_KEY loaded:', !!process.env.AIRTABLE_API_KEY);
}

import express from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import multer from 'multer';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

// ─── Uploads folder (served publicly so Airtable can download from it) ────────
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
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

function getPublicBase(): string {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}`;
  // For Vercel deployments, use the VERCEL_URL environment variable
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${PORT}`;
}

// ─── Fetch Listings (Airtable proxy) ────────────────────────────────────────
app.get('/api/listings', async (_req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = getRequiredEnv('AIRTABLE_BASE_ID');
    const AIRTABLE_TABLE_ID = getRequiredEnv('AIRTABLE_TABLE_ID');

    const allRecords: unknown[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({
        filterByFormula: `{Status} = "Active"`,
      });
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

    res.json({ records: allRecords });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching listings:', message);
    res.status(500).json({ error: message });
  }
});

// ─── Submit Business Listing (multipart with optional photo + headshot) ───────
app.post(
  '/api/submit-listing',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'headshot', maxCount: 1 },
  ]),
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

      function saveFile(file: Express.Multer.File): string {
        const ext = file.originalname?.split('.').pop() || 'jpg';
        const filename = `${randomUUID()}.${ext}`;
        writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
        return `${getPublicBase()}/uploads/${filename}`;
      }

      // Save business photo
      let photoAttachment: { url: string; filename: string }[] | undefined;
      const photoFile = files?.['photo']?.[0];
      if (photoFile) {
        try {
          const publicUrl = saveFile(photoFile);
          photoAttachment = [{ url: publicUrl, filename: photoFile.originalname || 'photo.jpg' }];
          console.log('Photo saved, public URL:', publicUrl);
        } catch (photoErr) {
          console.warn('Could not save photo (non-fatal):', photoErr);
        }
      }

      // Save headshot
      let headshotAttachment: { url: string; filename: string }[] | undefined;
      const headshotFile = files?.['headshot']?.[0];
      if (headshotFile) {
        try {
          const publicUrl = saveFile(headshotFile);
          headshotAttachment = [{ url: publicUrl, filename: headshotFile.originalname || 'headshot.jpg' }];
          console.log('Headshot saved, public URL:', publicUrl);
        } catch (headshotErr) {
          console.warn('Could not save headshot (non-fatal):', headshotErr);
        }
      }

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
      if (socialMedia)
        fields['Social Media Link (Instagram Preferred)'] = String(socialMedia).slice(0, 200);
      if (photoAttachment) fields['Photo'] = photoAttachment;
      if (headshotAttachment) fields['Headshot'] = headshotAttachment;

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
      console.log('Created Airtable record:', recordId);

      // Save personal category to "Niche" field (non-fatal — field must exist in Airtable)
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

// ─── Serve Frontend (only in production) ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start server (local development) or export for Vercel ──────────────────
// Vercel uses serverless functions; the app is exported as a module.
// For local development, we start the server normally.
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;