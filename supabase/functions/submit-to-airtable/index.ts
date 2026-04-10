const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AirtableAttachmentInput = { url: string };
type AirtableFieldValue = string | boolean | AirtableAttachmentInput[];

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const AIRTABLE_API_KEY = getRequiredEnv("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = getRequiredEnv("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_ID = getRequiredEnv("AIRTABLE_TABLE_ID");

    const body = await req.json();

    if (!body.ownerName || !body.email || !body.businessName || !body.category || !body.location || !body.contactDetails) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fields: Record<string, AirtableFieldValue> = {
      "Owner Name": String(body.ownerName).slice(0, 200),
      "Email": String(body.email).slice(0, 255),
      "Business Name": String(body.businessName).slice(0, 200),
      "Category": String(body.category).slice(0, 100),
      "Location": String(body.location).slice(0, 200),
      "Business Description": String(body.description || "").slice(0, 2000),
      "Contact Details": String(body.contactDetails).slice(0, 500),
      "Email Selected": Boolean(body.emailSelected),
    };

    if (body.headshot) fields["Headshot"] = [{ url: String(body.headshot).slice(0, 1000) }];
    if (body.businessPhoto) fields["Business Photo"] = [{ url: String(body.businessPhoto).slice(0, 1000) }];
    if (body.servicesOffered) fields["Services Offered"] = String(body.servicesOffered).slice(0, 2000);
    if (body.priceRange) fields["Price Range"] = String(body.priceRange).slice(0, 50);
    if (body.website) fields["Website"] = String(body.website).slice(0, 500);
    if (body.instagram) fields["Instagram Handle"] = String(body.instagram).slice(0, 100);
    if (body.otherSocialMedia) fields["Other Social Media"] = String(body.otherSocialMedia).slice(0, 500);
    if (body.howToContact) fields["How to Contact"] = String(body.howToContact).slice(0, 100);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Airtable create error:", errorBody);
      throw new Error(`Airtable API error [${response.status}]: ${errorBody}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error submitting to Airtable:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
