import { corsHeaders } from "@supabase/supabase-js/cors";

const AIRTABLE_BASE_ID = "appnyHwteIfAl2Mwh";
const AIRTABLE_TABLE_ID = "tblUDkirweEjepVji";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
  if (!AIRTABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AIRTABLE_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const allRecords: any[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({
        filterByFormula: `{Status} = "Active"`,
      });
      if (offset) params.set("offset", offset);

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?${params}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Airtable API error [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    return new Response(JSON.stringify({ records: allRecords }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
