import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UMRAH_PRICING = `UMRAH PACKAGES & PRICING (2025-2026):

1. ECONOMY UMRAH PACKAGE:
- Duration: 10 Nights (5 Makkah + 5 Madinah)
- Hotels: 3-star, walking distance from Haram
- Price: INR 85,000 per person (Quad sharing), INR 95,000 (Triple), INR 1,15,000 (Double)
- Includes: Return flights, Ziyarat tours, airport transfers, visa, daily breakfast
- Available: Year-round

2. DELUXE UMRAH PACKAGE:
- Duration: 12 Nights (6 Makkah + 6 Madinah)
- Hotels: 4-star, 200-500m from Haram
- Price: INR 1,25,000 per person (Quad), INR 1,45,000 (Triple), INR 1,75,000 (Double)
- Includes: Return flights, full Ziyarat, airport transfers, visa, daily breakfast & dinner
- Available: Year-round

3. PREMIUM UMRAH PACKAGE:
- Duration: 14 Nights (7 Makkah + 7 Madinah)
- Hotels: 5-star (Hilton/Swissotel/Pullman level), Haram-facing rooms
- Price: INR 2,25,000 per person (Triple), INR 2,85,000 (Double)
- Includes: Return business class flights, private Ziyarat, luxury transfers, visa, full board
- Available: Year-round

4. RAMADAN SPECIAL UMRAH:
- Duration: 15 Nights
- Hotels: 4-star minimum
- Price: Starting INR 1,85,000 per person
- Premium surcharge applies during last 10 nights of Ramadan
- Book 3+ months in advance recommended`;

const HAJJ_PACKAGES = `HAJJ PACKAGES (2026 Season):

1. ECONOMY HAJJ PACKAGE:
- Duration: 25-30 days
- Accommodation: Standard tents in Mina, shared rooms in Makkah/Madinah
- Price: INR 4,50,000 - 5,50,000 per person
- Includes: Hajj visa, flights, ground transport, meals, guided rituals

2. DELUXE HAJJ PACKAGE:
- Duration: 30-35 days
- Accommodation: Premium tents, 4-star hotels
- Price: INR 6,50,000 - 8,00,000 per person
- Includes: Everything in Economy + better accommodation, AC tents, dedicated guide

3. PREMIUM HAJJ PACKAGE:
- Duration: 35-40 days
- Accommodation: 5-star hotels, VIP tents closest to Jamarat
- Price: INR 10,00,000 - 15,00,000 per person
- Includes: Business class flights, VIP ground services, private guide, premium meals

NOTE: Hajj prices are estimates and subject to change based on Saudi government quota allocations and seasonal demand. Early booking (6+ months before) is strongly recommended. Government Hajj quota is limited.`;

const VISA_DETAILS = `VISA DETAILS & PRICING:

1. SAUDI ARABIA (Umrah/Hajj):
- Umrah Visa: INR 8,000-12,000 | Processing: 3-5 working days
- Hajj Visa: Included in Hajj packages | Processing: As per quota allocation
- Tourist Visa (eVisa): INR 5,000-7,000 | Processing: 24-48 hours
- Requirements: Valid passport (6+ months), passport-size photos, vaccination certificates (Meningitis ACWY mandatory)

2. UAE (Dubai/Abu Dhabi):
- Tourist Visa (30 days): INR 4,500-6,000 | Processing: 2-3 days
- Transit Visa (96 hours): INR 2,500 | Processing: 1-2 days

3. TURKEY:
- eVisa: INR 3,500-4,500 | Processing: Instant to 24 hours
- Sticker Visa: INR 5,000-7,000 | Processing: 5-7 days

4. MALAYSIA:
- eVisa (eNTRI): INR 1,500-2,500 | Processing: 24-48 hours

5. SINGAPORE:
- Tourist Visa: INR 3,000-4,500 | Processing: 3-5 days

6. THAILAND:
- Visa on Arrival (15 days): INR 2,000 | At airport
- Tourist Visa (60 days): INR 3,500 | Processing: 3-5 days

7. EGYPT:
- eVisa: INR 2,500-3,500 | Processing: 5-7 days

8. AZERBAIJAN:
- eVisa (ASAN): INR 2,000-3,000 | Processing: 3 days

Note: Visa prices may vary based on nationality and processing speed. Marhaba DMC handles complete visa processing.`;

const GROUP_PACKAGES = `GROUP UMRAH PACKAGES (Minimum 10 persons):

1. BUDGET GROUP UMRAH:
- Duration: 10 Nights
- Hotels: 3-star
- Price: INR 75,000 per person (groups of 15+), INR 80,000 (groups of 10-14)
- Group Leader travels FREE for groups of 20+
- Includes: Group visa, flights, Ziyarat, transfers, meals

2. PREMIUM GROUP UMRAH:
- Duration: 14 Nights
- Hotels: 4-5 star
- Price: INR 1,50,000 per person (groups of 15+), INR 1,65,000 (groups of 10-14)
- 2 Group Leaders travel FREE for groups of 25+
- Includes: Premium visa processing, flights, private Ziyarat, luxury transfers, full board

GROUP DISCOUNTS:
- 10-14 persons: 5% discount on published rates
- 15-24 persons: 8% discount + 1 free leader
- 25-39 persons: 10% discount + 2 free leaders
- 40+ persons: 12% discount + custom benefits, dedicated coordinator

CUSTOM GROUP PACKAGES:
- Corporate Umrah groups
- Family reunion Umrah packages
- Masjid/Community group packages
- Contact for custom pricing based on group size and requirements`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Fetch current config
    const { data: existing } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", "nyra_config")
      .maybeSingle();

    const currentConfig = existing?.value || { knowledge_base: [], behavior_instructions: [], communication_enabled: { email: false, whatsapp: false, sms: false }, additional_notes: [] };
    const kb: string[] = Array.isArray(currentConfig.knowledge_base) ? currentConfig.knowledge_base : [];

    // Check if already seeded
    const alreadyHasUmrah = kb.some((entry: string) => entry.includes("UMRAH PACKAGES & PRICING"));
    if (alreadyHasUmrah) {
      return new Response(JSON.stringify({ message: "Umrah/Hajj data already exists in knowledge base" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Append new entries
    const updatedKb = [...kb, UMRAH_PRICING, HAJJ_PACKAGES, VISA_DETAILS, GROUP_PACKAGES];
    const updatedConfig = { ...currentConfig, knowledge_base: updatedKb };

    const { error } = await sb
      .from("site_settings")
      .upsert(
        { key: "nyra_config", value: updatedConfig, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, entries_added: 4, total_kb_entries: updatedKb.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-knowledge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
