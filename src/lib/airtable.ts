export interface Listing {
  id: string;
  businessName: string;
  fullName: string;
  businessPhoto: string | null;
  ownerHeadshot: string | null;
  category: string;
  cityAndState: string;
  country: string;
  description: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  otherSocialMedia: string | null;
}

type AirtableFieldValue = string | number | boolean | null | undefined | AirtableAttachment[] | string[];

type AirtableAttachment = {
  url?: string;
};

type AirtableRecord = {
  id?: string;
  fields?: Record<string, AirtableFieldValue>;
};

function asString(value: AirtableFieldValue): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "url" in item && typeof item.url === "string") {
          return item.url;
        }
        return "";
      })
      .filter((item) => item.trim().length > 0)
      .join(", ");
  }
  return "";
}

function asStringOrNull(value: AirtableFieldValue): string | null {
  const parsed = asString(value).trim();
  return parsed.length ? parsed : null;
}

function extractAttachmentUrl(value: AirtableFieldValue): string | null {
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first && typeof first.url === "string") {
      return first.url;
    }
  }
  if (typeof value === "string") return value;
  return null;
}

function pickField(fields: Record<string, AirtableFieldValue>, ...names: string[]): AirtableFieldValue {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedFieldEntries = Object.entries(fields).map(([key, value]) => [normalize(key), value] as const);

  for (const name of names) {
    if (name in fields) return fields[name];

    const normalizedName = normalize(name);
    const matchedEntry = normalizedFieldEntries.find(([normalizedKey]) => normalizedKey === normalizedName);
    if (matchedEntry) return matchedEntry[1];
  }
  return undefined;
}

function parseRecord(record: unknown): Listing | null {
  if (!record || typeof record !== "object") return null;

  const typedRecord = record as AirtableRecord;
  const id = typeof typedRecord.id === "string" && typedRecord.id.trim().length
    ? typedRecord.id
    : null;
  const fields = typedRecord.fields;

  if (!id || !fields || typeof fields !== "object") return null;

  const categoryValue = pickField(fields, "Category", "category");
  const category = Array.isArray(categoryValue)
    ? asString(categoryValue[0] as AirtableFieldValue)
    : asString(categoryValue);

  return {
    id,
    businessName: asString(pickField(fields, "Business Name", "Name")) || "Untitled",
    fullName: asString(pickField(fields, "Full Name", "Owner Name")),
    businessPhoto: extractAttachmentUrl(pickField(fields, "Photo", "Business Photo", "Headshot")),
    ownerHeadshot: extractAttachmentUrl(pickField(fields, "Photo", "Headshot", "Owner Headshot")),
    category: category || "Uncategorized",
    cityAndState: asString(pickField(fields, "City and State", "Location")) || "Unknown",
    country: asString(pickField(fields, "Country")) || "",
    description: asString(pickField(fields, "Short Bio", "Business Description", "Description")) || "",
    email: asStringOrNull(pickField(fields, "Email")),
    phone: asStringOrNull(pickField(fields, "Phone")),
    website: asStringOrNull(pickField(fields, "Website", "Website or Booking Link")),
    instagram: asStringOrNull(pickField(fields, "Social Media Link (Instagram Preferred)", "Instagram Handle", "Instagram")),
    otherSocialMedia: asStringOrNull(pickField(fields, "Other Social Media")),
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const response = await fetch("/api/listings");
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  const records = Array.isArray(data?.records) ? data.records : [];
  return records
    .map(parseRecord)
    .filter((listing): listing is Listing => listing !== null);
}
