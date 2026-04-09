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

function parseRecord(record: any): Listing {
  const f = record.fields;
  return {
    id: record.id,
    businessName: f["Business Name"] || f["Name"] || "Untitled",
    businessPhoto: f["Business Photo"]?.[0]?.url || f["Business Photo"] || null,
    ownerHeadshot: f["Owner Headshot"]?.[0]?.url || f["Owner Headshot"] || null,
    category: f["Category"] || "Uncategorized",
    location: f["Location"] || "Unknown",
    description: f["Business Description"] || f["Description"] || "",
    priceRange: f["Price Range"] || "",
    website: f["Website"] || null,
    instagram: f["Instagram"] || f["Instagram Handle"] || null,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase.functions.invoke("fetch-listings");
  if (error) throw error;
  return (data.records || []).map(parseRecord);
}
