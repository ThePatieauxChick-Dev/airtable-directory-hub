import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __filename and __dirname equivalents for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file ONLY in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  console.log('🔑 AIRTABLE_API_KEY loaded:', !!process.env.AIRTABLE_API_KEY);
}

import express from 'express';
import multer from 'multer';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

// ─── Multer setup (memory storage – no disk writes) ────────────────────────
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

// ─── Helper: convert file buffer to Airtable attachment object ─────────────
function fileToAttachment(file: Express.Multer.File): { url: string; filename: string } {
  const base64 = file.buffer.toString('base64');
  return {
    url: `data:${file.mimetype};base64,${base64}`,
    filename: file.originalname || 'image.jpg',
  };
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

// ─── Submit Business Listing (uploads go directly to Airtable) ──────────────
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

      // Prepare attachments for Airtable (base64 data URLs)
      let photoAttachment: { url: string; filename: string }[] | undefined;
      const photoFile = files?.['photo']?.[0];
      if (photoFile) {
        photoAttachment = [fileToAttachment(photoFile)];
      }

      let headshotAttachment: { url: string; filename: string }[] | undefined;
      const headshotFile = files?.['headshot']?.[0];
      if (headshotFile) {
        headshotAttachment = [fileToAttachment(headshotFile)];
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

// ─── Get Categories (for dropdown in submit form) ─────────────────────────
app.get('/api/get-categories', async (_req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = getRequiredEnv('AIRTABLE_BASE_ID');
    const AIRTABLE_TABLE_ID = getRequiredEnv('AIRTABLE_TABLE_ID');

    // Fetch the table metadata to get the Category field's select options
    const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      // If metadata fetch fails, fall back to static list
      throw new Error(`Airtable metadata error: ${response.status}`);
    }

    const data = await response.json();
    const table = data.tables?.find((t: any) => t.id === AIRTABLE_TABLE_ID);
    const categoryField = table?.fields?.find((f: any) => f.name === 'Category');

    if (categoryField?.options?.choices) {
      const categories = categoryField.options.choices.map((c: any) => c.name);
      res.json({ categories });
    } else {
      // Fallback if field not found
      res.json({ categories: [] });
    }
  } catch (error) {
    console.warn('Could not fetch categories from Airtable, using fallback list');
    // Return empty to let frontend use its fallback
    res.json({ categories: [] });
  }
}); 

// ─── Serve Frontend (only in production) ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));

  app.use('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start server (local development) or export for Vercel ──────────────────
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;