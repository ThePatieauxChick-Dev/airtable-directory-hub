import { supabase } from "@/integrations/supabase/client";

export interface Listing {
  id: string;
  businessName: string;
  ownerName: string;
  email: string | null;
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
  for (const name of names) {
    if (name in fields) return fields[name];
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
    businessName: asString(pickField(fields, "Business Name", "Name", "business_name")) || "Untitled",
    ownerName: asString(pickField(fields, "Owner Name", "owner_name")),
    email: asStringOrNull(pickField(fields, "Email", "email")),
    businessPhoto: extractAttachmentUrl(pickField(fields, "Business Photo", "business_photo")),
    ownerHeadshot: extractAttachmentUrl(pickField(fields, "Headshot", "Owner Headshot", "owner_headshot")),
    category: category || "Uncategorized",
    location: asString(pickField(fields, "Location", "location")) || "Unknown",
    description: asString(pickField(fields, "Business Description", "Description", "description")) || "",
    servicesOffered: asString(pickField(fields, "Services Offered", "services_offered")),
    priceRange: asString(pickField(fields, "Price Range", "price_range")),
    website: asStringOrNull(pickField(fields, "Website", "website")),
    instagram: asStringOrNull(pickField(fields, "Instagram Handle", "Instagram", "instagram")),
    otherSocialMedia: asStringOrNull(pickField(fields, "Other Social Media", "other_social_media")),
    howToContact: asStringOrNull(pickField(fields, "How to Contact", "how_to_contact", "How To Contact")),
    contactDetails: asStringOrNull(pickField(fields, "Contact Details", "contact_details")),
    emailSelected: asBoolean(pickField(fields, "Email Selected", "email_selected")),
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
