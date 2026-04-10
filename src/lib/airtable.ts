import { supabase } from "@/integrations/supabase/client";

export interface Listing {
  id: string;
  businessName: string;
  ownerName: string;
  businessPhoto: string | null;
  ownerHeadshot: string | null;
  category: string;
  location: string;
  description: string;
  servicesOffered: string;
  priceRange: string;
  website: string | null;
  instagram: string | null;
  otherSocialMedia: string | null;
  howToContact: string | null;
  contactDetails: string | null;
  emailSelected: boolean;
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

function asBoolean(value: AirtableFieldValue): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "1";
  }
  return false;
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
    ownerName: asString(pickField(fields, "Owner Name")),
    businessPhoto: extractAttachmentUrl(pickField(fields, "Business Photo")),
    ownerHeadshot: extractAttachmentUrl(pickField(fields, "Headshot", "Owner Headshot")),
    category: category || "Uncategorized",
    location: asString(pickField(fields, "Location")) || "Unknown",
    description: asString(pickField(fields, "Business Description", "Description")) || "",
    servicesOffered: asString(pickField(fields, "Services Offered")),
    priceRange: asString(pickField(fields, "Price Range")),
    website: asStringOrNull(pickField(fields, "Website")),
    instagram: asStringOrNull(pickField(fields, "Instagram Handle", "Instagram")),
    otherSocialMedia: asStringOrNull(pickField(fields, "Other Social Media")),
    howToContact: asStringOrNull(pickField(fields, "How to Contact")),
    contactDetails: asStringOrNull(pickField(fields, "Contact Details")),
    emailSelected: asBoolean(pickField(fields, "Email Selected")),
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase.functions.invoke("fetch-listings");
  if (error) throw error;

  const records = Array.isArray(data?.records) ? data.records : [];
  return records
    .map(parseRecord)
    .filter((listing): listing is Listing => listing !== null);
}
