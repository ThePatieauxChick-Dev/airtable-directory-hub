const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AIRTABLE_BASE_ID = "appnyHwteIfAl2Mwh";
const AIRTABLE_TABLE_ID = "tblUDkirweEjepVji";

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

  const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
  if (!AIRTABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AIRTABLE_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.ownerName || !body.email || !body.businessName || !body.category || !body.location) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fields: Record<string, any> = {
      "Business Name": String(body.businessName).slice(0, 200),
      "Category": [String(body.category).slice(0, 100)],
      "Location": String(body.location).slice(0, 200),
      "Business Description": String(body.description || "").slice(0, 2000),
      "Status": "Pending",
    };

    // Optional fields — map to common Airtable column names
    if (body.ownerName) fields["Owner Name"] = String(body.ownerName).slice(0, 200);
    if (body.email) fields["Email"] = String(body.email).slice(0, 255);
    if (body.phone) fields["Phone"] = String(body.phone).slice(0, 30);
    if (body.priceRange) fields["Price Range"] = String(body.priceRange).slice(0, 50);
    if (body.website) fields["Website"] = String(body.website).slice(0, 500);
    if (body.instagram) fields["Instagram"] = String(body.instagram).slice(0, 100);

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
