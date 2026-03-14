import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const {
      niche,
      brandConfig,
      targetRegions,
    } = await req.json();

    if (!niche) {
      return new Response(
        JSON.stringify({ error: "Niche is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const authorityDomains: string[] = (brandConfig?.authority_domains ||
      []) as string[];
    const researchDepth: "quick" | "full" = (brandConfig?.research_depth ||
      "full") as "quick" | "full";
    const regionCountryCodes: Record<string, string> = (brandConfig
      ?.region_country_codes || {}) as Record<string, string>;
    const targetRegionsArray: string[] = (targetRegions &&
        Array.isArray(targetRegions)
      ? targetRegions
      : brandConfig?.target_regions || []) as string[];

    const queries: {
      key: string;
      query: string;
      systemPrompt: string;
      region?: string;
      options?: Record<string, unknown>;
    }[] = [];

    // Core SERP + PAA + Related for the broad niche
    queries.push({
      key: "niche_serp",
      ...buildClusterSerpQuery(niche),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "high" },
      },
    });

    // Featured snippet patterns for the niche
    queries.push({
      key: "featured_snippets",
      ...buildFeaturedSnippetQuery(niche),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "medium" },
      },
    });

    // GSO / AI citation patterns (ChatGPT, Gemini, Perplexity)
    queries.push({
      key: "gso_citations",
      ...buildGsoCitationQuery(niche),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "medium" },
      },
    });

    // Competitor cluster structures if competitor URLs are provided
    if (brandConfig?.competitor_urls?.length) {
      queries.push({
        key: "competitor_clusters",
        ...buildCompetitorClusterQuery(
          niche,
          brandConfig.competitor_urls as string[],
        ),
        options: {
          search_recency_filter: "month",
          web_search_options: { search_context_size: "medium" },
        },
      });
    }

    // Optional regional nuance (lightweight vs full)
    if (researchDepth === "full") {
      const regions = targetRegionsArray.length > 0
        ? targetRegionsArray
        : [];
      const regionsToUse = regions.slice(0, 3);

      for (const region of regionsToUse) {
        const countryCode = regionCountryCodes[region];
        const userLocation = countryCode ? { country: countryCode } : undefined;

        queries.push({
          key: "regional_cluster_serp",
          region,
          ...buildRegionalClusterSerpQuery(niche, region, countryCode),
          options: {
            search_recency_filter: "month",
            web_search_options: {
              search_context_size: "high",
              ...(userLocation ? { user_location: userLocation } : {}),
            },
          },
        });
      }
    }

    const results = await Promise.allSettled(
      queries.map((q) =>
        callPerplexity(
          PERPLEXITY_API_KEY,
          q.query,
          q.systemPrompt,
          q.options || {},
        )
      ),
    );

    let niche_serp: any = null;
    let featured_snippets: any = null;
    let gso_citations: any = null;
    let competitor_clusters: any = null;
    const regionalClusterMap: Record<
      string,
      { region: string; country_code?: string; serp_content?: string }
    > = {};

    results.forEach((res, idx) => {
      const q = queries[idx];
      if (res.status !== "fulfilled") return;
      const value = res.value;
      switch (q.key) {
        case "niche_serp":
          niche_serp = value;
          break;
        case "featured_snippets":
          featured_snippets = value;
          break;
        case "gso_citations":
          gso_citations = value;
          break;
        case "competitor_clusters":
          competitor_clusters = value;
          break;
        case "regional_cluster_serp": {
          if (!q.region) break;
          const key = q.region;
          const existing = regionalClusterMap[key] || {
            region: key,
            country_code: regionCountryCodes[key],
          };
          existing.serp_content = value.content;
          regionalClusterMap[key] = existing;
          break;
        }
        default:
          break;
      }
    });

    const regional_cluster_insights = Object.values(regionalClusterMap);

    const research = {
      niche,
      niche_serp,
      featured_snippets,
      gso_citations,
      competitor_clusters,
      regional_cluster_insights,
      researched_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, research }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blog-cluster-research error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildClusterSerpQuery(niche: string) {
  return {
    systemPrompt:
      "You are an SEO and topical authority research analyst. Provide structured, data-rich analysis suitable for designing complete content clusters.",
    query: `Analyze the search landscape for the broad niche: "${niche}".

Provide:
1. The main intent buckets (3-8) users have around this niche and how they map into potential content clusters.
2. For each intent bucket, list the top ranking URLs and summarize their angle, depth, and structure.
3. Core keywords and long-tail variants for each bucket.
4. People Also Ask questions and related searches grouped under each bucket.
5. Obvious content gaps and underserved angles for each bucket (by region, audience, format, or specificity).`,
  };
}

function buildFeaturedSnippetQuery(niche: string) {
  return {
    systemPrompt:
      "You are a Featured Snippet strategist. Identify patterns that win snippets and PAA placements.",
    query: `For the niche "${niche}", analyze Google Featured Snippets and People Also Ask results.

Provide:
1. The most common snippet formats (definition paragraph, list, table, how-to steps, comparison, etc.).
2. Example queries where snippets appear and how the winning pages structure their answers.
3. Recommended snippet targets we should design for across the niche (at least 10), with the ideal format for each.
4. Structural guidelines (heading patterns, answer length, schema usage) that consistently show up in snippet-winning content.`,
  };
}

function buildGsoCitationQuery(niche: string) {
  return {
    systemPrompt:
      "You are a Generative Search Optimization analyst focusing on AI answer engines (ChatGPT, Gemini, Perplexity, Claude).",
    query: `For the niche "${niche}", analyze how AI answer engines typically construct their answers.

Provide:
1. The types of sources they tend to cite (official, aggregators, blogs, marketplaces, etc.).
2. Common structural patterns in content that gets cited (deep guides, FAQs, comparison pages, checklists, etc.).
3. Recommendations for how a single site can structure its content clusters to maximize the chance of being cited across many related queries.
4. Any known entities (brands, destinations, concepts) that are central to this niche and should be covered as dedicated nodes in the cluster map.`,
  };
}

function buildCompetitorClusterQuery(niche: string, competitors: string[]) {
  return {
    systemPrompt:
      "You are a competitive content cluster analyst. Deconstruct how competitors structure their content for a niche.",
    query: `Analyze how these competitor websites structure their content clusters for the niche "${niche}": ${competitors.join(
      ", ",
    )}

Provide:
1. For each competitor, list their main cluster topics and pillar pages.
2. Example supporting content types they use under each cluster (guides, city pages, FAQs, itineraries, comparison posts, etc.).
3. Strengths and weaknesses of each competitor's cluster design.
4. Opportunities for a halal-friendly B2B DMC to create a more complete, non-overlapping cluster architecture that outperforms them.`,
  };
}

function buildRegionalClusterSerpQuery(
  niche: string,
  region: string,
  countryCode?: string,
) {
  const locationText = countryCode
    ? ` Focus on searchers in ${region} (${countryCode}).`
    : ` Focus on the ${region} market.`;
  return {
    systemPrompt:
      "You are a regional SEO and content strategist. Focus on regional nuances for cluster design.",
    query: `For the niche "${niche}", analyze search results and questions in ${region}.${locationText}

Provide:
1. Region-specific intents or subtopics that should become their own clusters or supporting posts.
2. Localized People Also Ask questions and related searches.
3. Any regional compliance, cultural, or seasonal aspects we must address in content.
4. Recommendations for how to adapt the global cluster map for this region.`,
  };
}

async function callPerplexity(
  apiKey: string,
  query: string,
  systemPrompt: string,
  extraOptions: Record<string, unknown> = {},
) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      search_recency_filter: "month",
      ...extraOptions,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Perplexity API error:", response.status, text);
    if (response.status === 402) {
      throw new Error(
        "Perplexity credits exhausted. Please top up your Perplexity account.",
      );
    }
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

