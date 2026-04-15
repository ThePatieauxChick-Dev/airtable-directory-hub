import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

// ─── Fetch Listings (Airtable proxy) ────────────────────────────────────────
app.get("/api/listings", async (_req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = getRequiredEnv("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_ID = getRequiredEnv("AIRTABLE_TABLE_ID");

    const allRecords: unknown[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({
        filterByFormula: `{Status} = "Active"`,
      });
      if (offset) params.set("offset", offset);

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
      offset = typeof data.offset === "string" ? data.offset : undefined;
    } while (offset);

    res.json({ records: allRecords });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching listings:", message);
    res.status(500).json({ error: message });
  }
});

// ─── Submit Business Listing (multipart with optional photo) ─────────────────
app.post("/api/submit-listing", upload.single("photo"), async (req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = getRequiredEnv("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_ID = getRequiredEnv("AIRTABLE_TABLE_ID");

    const {
      fullName, phone, email, cityAndState, country,
      shortBio, category, businessName, whatOffer,
      website, socialMedia, personalCategory,
    } = req.body;

    if (!fullName || !email || !cityAndState || !country || !businessName || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const fields: Record<string, string | string[]> = {
      "Full Name": String(fullName).slice(0, 200),
      "Email": String(email).slice(0, 500),
      "City and State": String(cityAndState).slice(0, 200),
      "Country": String(country).slice(0, 200),
      "Business Name": String(businessName).slice(0, 200),
      "Category": [String(category).slice(0, 100)],
      "Status": "Pending",
    };

    if (phone) fields["Phone"] = String(phone).slice(0, 50);
    if (shortBio) fields["Short Bio"] = String(shortBio).slice(0, 2000);
    if (whatOffer) fields["What Do You Offer"] = String(whatOffer).slice(0, 2000);
    if (website) fields["Website or Booking Link"] = String(website).slice(0, 500);
    if (socialMedia) fields["Social Media Link (Instagram Preferred)"] = String(socialMedia).slice(0, 200);

    // Create the record first
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: true }),
    });

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      console.error("Airtable create error:", errorBody);
      throw new Error(`Airtable API error [${createResponse.status}]: ${errorBody}`);
    }

    const result = await createResponse.json();
    const recordId = result.id as string;

    // Save personal category to "Niche" field (non-fatal — field must exist in Airtable)
    if (personalCategory) {
      try {
        await fetch(`${createUrl}/${recordId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: { "Niche": String(personalCategory) }, typecast: true }),
        });
      } catch {
        console.warn("Could not save personal category (non-fatal)");
      }
    }

    // Upload photo if provided
    if (req.file) {
      try {
        const photoFormData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        photoFormData.append("file", blob, req.file.originalname || "photo.jpg");
        photoFormData.append("filename", req.file.originalname || "photo.jpg");
        photoFormData.append("contentType", req.file.mimetype);

        const photoUrl = `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${recordId}/Headshot/uploadAttachment`;
        const photoResponse = await fetch(photoUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
          body: photoFormData,
        });

        if (!photoResponse.ok) {
          const photoErr = await photoResponse.text();
          console.warn("Photo upload warning (non-fatal):", photoErr);
        } else {
          console.log("Photo uploaded successfully for record", recordId);
        }
      } catch (photoErr) {
        console.warn("Photo upload failed (non-fatal):", photoErr);
      }
    }

    res.json({ success: true, id: recordId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error submitting listing:", message);
    res.status(500).json({ error: message });
  }
});

// ─── Serve Frontend ──────────────────────────────────────────────────────────
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
