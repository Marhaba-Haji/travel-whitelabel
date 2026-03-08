import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const { topic, competitors, targetRegion, targetAudience } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build research queries
    const queries = [
      // 1. SERP & competitor analysis
      buildSerpQuery(topic, targetRegion),
      // 2. Industry trends & statistics
      buildTrendsQuery(topic, targetAudience),
      // 3. Competitor content analysis (if URLs provided)
      ...(competitors?.length ? [buildCompetitorQuery(topic, competitors)] : []),
    ];

    // Run all research queries in parallel
    const results = await Promise.allSettled(
      queries.map((q) => callPerplexity(PERPLEXITY_API_KEY, q.query, q.systemPrompt))
    );

    const research = {
      serp_analysis: results[0].status === "fulfilled" ? results[0].value : null,
      industry_trends: results[1].status === "fulfilled" ? results[1].value : null,
      competitor_insights: results.length > 2 && results[2].status === "fulfilled" ? results[2].value : null,
      topic,
      targetRegion: targetRegion || "Global",
      targetAudience: targetAudience || "B2B travel agents and tour operators",
      researched_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, research }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blog-research error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildSerpQuery(topic: string, region?: string) {
  const regionContext = region ? ` Focus on the ${region} market.` : "";
  return {
    systemPrompt:
      "You are an SEO research analyst. Provide structured, data-rich analysis of search results. Include specific data points, statistics, and content gaps.",
    query: `Analyze the top-ranking content for the topic: "${topic}".${regionContext}

Provide:
1. What are the top 5 articles ranking for this topic? Summarize their angles and structure.
2. What keywords and phrases appear most frequently?
3. What content gaps exist — what are these articles NOT covering?
4. What questions do people commonly ask about this topic (People Also Ask)?
5. What's the ideal content structure and word count to outrank existing content?`,
  };
}

function buildTrendsQuery(topic: string, audience?: string) {
  const audienceContext = audience ? ` The target audience is: ${audience}.` : "";
  return {
    systemPrompt:
      "You are a travel industry research analyst specializing in halal travel, DMC services, and hospitality technology. Provide current, data-backed insights.",
    query: `What are the latest trends, statistics, and developments related to: "${topic}"?${audienceContext}

Provide:
1. Recent statistics and data points (with sources/dates)
2. Emerging trends in this space (last 6 months)
3. Expert quotes or industry reports relevant to this topic
4. Regional market insights if applicable
5. Seasonal or timing considerations for this content`,
  };
}

function buildCompetitorQuery(topic: string, competitors: string[]) {
  return {
    systemPrompt:
      "You are a competitive content analyst. Analyze competitor content strategies and identify opportunities for differentiation.",
    query: `Analyze how these competitor websites cover the topic "${topic}": ${competitors.join(", ")}

Provide:
1. What angles do they take on this topic?
2. What content formats do they use (listicles, guides, case studies)?
3. What keywords do they target?
4. What are their content strengths and weaknesses?
5. How can Marhaba DMC differentiate its content to stand out?`,
  };
}

async function callPerplexity(apiKey: string, query: string, systemPrompt: string) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      search_recency_filter: "month",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Perplexity API error:", response.status, text);
    if (response.status === 402) {
      throw new Error("Perplexity credits exhausted. Please top up your Perplexity account.");
    }
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}
