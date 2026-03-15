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

    const {
      topic,
      competitors,
      targetRegion,
      targetAudience,
      brandConfig,
      targetRegions,
    } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authorityDomains: string[] = (brandConfig?.authority_domains || []) as string[];
    const researchDepth: "quick" | "full" = (brandConfig?.research_depth || "full") as "quick" | "full";
    const regionCountryCodes: Record<string, string> = (brandConfig?.region_country_codes || {}) as Record<string, string>;
    const targetRegionsArray: string[] =
      (targetRegions && Array.isArray(targetRegions) ? targetRegions : brandConfig?.target_regions || []) as string[];

    // Build research queries (global + optional regional/brand)
    const queries: {
      key: string;
      query: string;
      systemPrompt: string;
      region?: string;
      options?: Record<string, unknown>;
    }[] = [];

    // 1. Global SERP analysis
    queries.push({
      key: "global_serp",
      ...buildSerpQuery(topic, targetRegion),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "high" },
      },
    });

    // 2. Global industry trends & statistics
    queries.push({
      key: "global_trends",
      ...buildTrendsQuery(topic, targetAudience),
      options: {
        search_recency_filter: "week",
        ...(authorityDomains.length ? { search_domain_filter: authorityDomains } : {}),
        web_search_options: { search_context_size: "high" },
      },
    });

    // 3. Competitor content analysis (if URLs provided)
    if (competitors?.length) {
      queries.push({
        key: "competitor_content",
        ...buildCompetitorQuery(topic, competitors),
        options: {
          search_recency_filter: "month",
          web_search_options: { search_context_size: "medium" },
        },
      });
    }

    // NEW: 4. PAA & Featured Snippet extraction
    queries.push({
      key: "paa_snippets",
      ...buildPAASnippetQuery(topic),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "high" },
      },
    });

    // NEW: 5. AI Engine citation analysis
    queries.push({
      key: "ai_citations",
      ...buildAICitationQuery(topic),
      options: {
        search_recency_filter: "month",
        web_search_options: { search_context_size: "high" },
      },
    });

    // 6. Brand & competition landscape (full mode)
    if (researchDepth === "full") {
      queries.push({
        key: "brand_positioning",
        ...buildBrandQuery(
          topic,
          (brandConfig?.brand_keywords || []) as string[],
          (brandConfig?.differentiators || "") as string
        ),
        options: {
          search_recency_filter: "month",
          search_domain_filter: ["marhabadmc.com", ...(authorityDomains || [])],
        },
      });

      queries.push({
        key: "competition_landscape",
        ...buildCompetitionLandscapeQuery(topic),
        options: {
          search_recency_filter: "month",
        },
      });

      // Regional research for up to 3 regions
      const regions =
        targetRegionsArray.length > 0
          ? targetRegionsArray
          : (targetRegion ? String(targetRegion).split(",").map((r) => r.trim()).filter(Boolean) : []);
      const regionsToUse = regions.slice(0, 3);

      for (const region of regionsToUse) {
        const countryCode = regionCountryCodes[region];
        const userLocation = countryCode ? { country: countryCode } : undefined;

        // Regional SERP
        queries.push({
          key: "regional_serp",
          region,
          ...buildRegionalSerpQuery(topic, region, countryCode),
          options: {
            search_recency_filter: "month",
            web_search_options: {
              search_context_size: "high",
              ...(userLocation ? { user_location: userLocation } : {}),
            },
          },
        });

        // Regional market insights
        queries.push({
          key: "regional_market",
          region,
          ...buildRegionalMarketQuery(topic, region, countryCode),
          options: {
            search_recency_filter: "month",
            ...(userLocation
              ? {
                  web_search_options: {
                    user_location: userLocation,
                  },
                }
              : {}),
          },
        });
      }
    }

    // Run all research queries in parallel
    const results = await Promise.allSettled(
      queries.map((q) =>
        callPerplexity(PERPLEXITY_API_KEY, q.query, q.systemPrompt, q.options || {})
      )
    );

    // Map results back into structured research object
    let serp_analysis: any = null;
    let industry_trends: any = null;
    let competitor_insights: any = null;
    let brand_positioning: any = null;
    let competition_landscape: any = null;
    let paa_snippets: any = null;
    let ai_citations: any = null;
    const regionalInsightsMap: Record<
      string,
      { region: string; country_code?: string; serp_content?: string; market_content?: string }
    > = {};

    results.forEach((res, idx) => {
      const q = queries[idx];
      if (res.status !== "fulfilled") return;
      const value = res.value;
      switch (q.key) {
        case "global_serp":
          serp_analysis = value;
          break;
        case "global_trends":
          industry_trends = value;
          break;
        case "competitor_content":
          competitor_insights = value;
          break;
        case "brand_positioning":
          brand_positioning = value;
          break;
        case "competition_landscape":
          competition_landscape = value;
          break;
        case "paa_snippets":
          paa_snippets = value;
          break;
        case "ai_citations":
          ai_citations = value;
          break;
        case "regional_serp":
        case "regional_market": {
          if (!q.region) break;
          const key = q.region;
          const existing = regionalInsightsMap[key] || {
            region: key,
            country_code: regionCountryCodes[key],
          };
          if (q.key === "regional_serp") {
            existing.serp_content = value.content;
          } else {
            existing.market_content = value.content;
          }
          regionalInsightsMap[key] = existing;
          break;
        }
        default:
          break;
      }
    });

    const regional_insights = Object.values(regionalInsightsMap);

    const research = {
      serp_analysis,
      industry_trends,
      competitor_insights,
      regional_insights,
      brand_positioning,
      competition_landscape,
      paa_snippets,
      ai_citations,
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

function buildPAASnippetQuery(topic: string) {
  return {
    systemPrompt:
      "You are a Google SERP feature specialist. Your job is to extract the exact People Also Ask questions, Featured Snippet content, and Related Searches for a given topic. Be specific and data-driven.",
    query: `For the topic "${topic}", provide a comprehensive analysis of Google SERP features:

1. **People Also Ask (PAA)**: List the exact 8-12 PAA questions that appear when searching for this topic and closely related queries. Format each as the exact question.

2. **Current Featured Snippets**: For each PAA question and the main topic query, describe:
   - What type of snippet currently appears (paragraph, list, table, or none)
   - Which website currently holds the snippet
   - The approximate length and format of the winning snippet

3. **Related Searches**: List the 8-10 "Related Searches" that appear at the bottom of Google results for this topic.

4. **Snippet Opportunities**: Identify which questions/queries have WEAK or MISSING featured snippets that a well-structured article could win.

5. **Optimal Answer Format**: For each snippet opportunity, specify the ideal format (40-60 word paragraph, numbered list, comparison table, or definition) to win that snippet.`,
  };
}

function buildAICitationQuery(topic: string) {
  return {
    systemPrompt:
      "You are an AI search optimization specialist who analyzes how AI-powered search engines (ChatGPT, Google Gemini, Claude, Perplexity) answer questions and which sources they cite. Provide actionable insights for content that gets cited by AI engines.",
    query: `Analyze how AI search engines currently answer questions about "${topic}":

1. **AI Answer Patterns**: When users ask ChatGPT, Gemini, or Perplexity about "${topic}", what structure do the AI responses typically follow? (e.g., definition first, then list, then comparison)

2. **Cited Sources**: What types of content and which specific websites do AI engines tend to cite when answering about this topic? List specific domains and content types.

3. **Content Characteristics**: What characteristics make content more likely to be cited by AI engines? (e.g., clear definitions, structured data, comparison tables, FAQ sections, authoritative tone)

4. **Entity Mentions**: What specific named entities (organizations, standards, certifications, destinations) do AI engines consistently mention when discussing this topic?

5. **Citation-Winning Structure**: Recommend the optimal article structure (headings, sections, data formats) that would maximize the chance of being cited as a source by ChatGPT, Gemini, Claude, and Perplexity when users ask about this topic.

6. **Gap Analysis**: What information about this topic do AI engines currently struggle to answer well or provide incomplete answers for? These are opportunities for new authoritative content.`,
  };
}

function buildBrandQuery(topic: string, brandKeywords: string[], differentiators: string) {
  const keywordsText = brandKeywords.join(", ");
  return {
    systemPrompt:
      "You are a brand and positioning analyst for a B2B halal-friendly Destination Management Company (Marhaba DMC). Provide clear, structured insights.",
    query: `Analyze how Marhaba DMC should position itself around the topic "${topic}".

Brand keywords: ${keywordsText || "N/A"}
Key differentiators: ${differentiators || "N/A"}

Provide:
1. Recommended brand positioning and key messages for this topic
2. How this positioning compares to typical DMCs / wholesalers in the same space
3. Specific proof points or angles Marhaba DMC should emphasize
4. Risks to avoid (overclaims, generic messaging)`,
  };
}

function buildCompetitionLandscapeQuery(topic: string) {
  return {
    systemPrompt:
      "You are a competitive landscape analyst for the global travel and DMC industry.",
    query: `For the topic "${topic}", describe the global competitive content landscape.

Provide:
1. Types of players creating content (OTAs, DMCs, wholesalers, tourism boards, bloggers)
2. Common content angles and formats used
3. Content strengths and weaknesses you observe
4. Opportunities for a B2B halal-friendly DMC to stand out with differentiated content`,
  };
}

function buildRegionalSerpQuery(topic: string, region: string, countryCode?: string) {
  const locationText = countryCode ? ` Focus on searchers in ${region} (${countryCode}).` : ` Focus on the ${region} market.`;
  return {
    systemPrompt:
      "You are an SEO research analyst. Provide structured, data-rich analysis of regional search results. Include specific data points, statistics, and content gaps.",
    query: `Analyze the top-ranking content for the topic: "${topic}".${locationText}

Provide:
1. What are the top 5 articles ranking in this region? Summarize their angles and structure.
2. What local nuances or preferences appear in this region's content?
3. What regional content gaps exist — what are these articles NOT covering?
4. Regional questions people commonly ask about this topic.
5. Recommendations for a region-specific angle that can outperform existing content.`,
  };
}

function buildRegionalMarketQuery(topic: string, region: string, countryCode?: string) {
  return {
    systemPrompt:
      "You are a regional travel market analyst specializing in halal travel, DMC services, and hospitality technology.",
    query: `For the topic "${topic}", analyze the ${region} market${countryCode ? ` (country code: ${countryCode})` : ""}.

Provide:
1. Key demand drivers and traveler segments in this region
2. Relevant statistics and data points (with sources/dates)
3. How halal travel, luxury, and technology trends intersect with this topic locally
4. Opportunities for B2B travel agents and DMCs focused on this region
5. Any regulatory, cultural, or seasonal factors that should shape content strategy`,
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
