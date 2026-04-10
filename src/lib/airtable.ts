import { supabase } from "@/integrations/supabase/client";

export interface Listing {
  id: string;
  businessName: string;
  businessPhoto: string | null;
  ownerHeadshot: string | null;
  category: string;
  location: string;
  description: string;
  priceRange: string;
  website: string | null;
  instagram: string | null;
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

function parseRecord(record: unknown): Listing | null {
  if (!record || typeof record !== "object") return null;

  const typedRecord = record as AirtableRecord;
  const id = typeof typedRecord.id === "string" && typedRecord.id.trim().length
    ? typedRecord.id
    : null;
  const fields = typedRecord.fields;

  if (!id || !fields || typeof fields !== "object") return null;

  const categoryValue = fields["Category"];
  const category = Array.isArray(categoryValue)
    ? asString(categoryValue[0] as AirtableFieldValue)
    : asString(categoryValue);

  return {
    id,
    businessName: asString(fields["Business Name"]) || asString(fields["Name"]) || "Untitled",
    businessPhoto: extractAttachmentUrl(fields["Business Photo"]),
    ownerHeadshot: extractAttachmentUrl(fields["Owner Headshot"]),
    category: category || "Uncategorized",
    location: asString(fields["Location"]) || "Unknown",
    description: asString(fields["Business Description"]) || asString(fields["Description"]) || "",
    priceRange: asString(fields["Price Range"]),
    website: asStringOrNull(fields["Website"]),
    instagram: asStringOrNull(fields["Instagram"]) || asStringOrNull(fields["Instagram Handle"]),
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
