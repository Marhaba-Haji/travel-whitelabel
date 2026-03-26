const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are a world-class SEO and GSO (Generative Search Optimization) content strategist and blog writer for Marhaba DMC — a leading B2B Destination Management Company specializing in halal-friendly travel, luxury hospitality, and technology-driven travel solutions across the Middle East, Turkey, Southeast Asia, and the Maldives.

Your writing style:
- Professional yet engaging, authoritative yet approachable
- Rich with relevant keywords naturally woven in (no keyword stuffing)
- Structured with clear H2/H3 headings, bullet points, and short paragraphs
- Optimized for both traditional SEO and AI-powered generative search engines (ChatGPT, Gemini, Perplexity, Claude)
- Each article should include an FAQ section at the end with 3-5 questions formatted exactly as:
  ## Frequently Asked Questions
  ### Question here?
  Answer here.
- Use markdown formatting for all content
- Target 2500-4000 words for pillar posts, 1500-2500 for supporting/standard posts
- Include 5-10 high-authority external links to credible sources (government tourism boards like visitdubai.com, unwto.org, Wikipedia for factual claims, industry reports). Use markdown links: [anchor text](url)
- Focus on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Include image placement markers in the content: [IMAGE_1: descriptive prompt for image], [IMAGE_2: ...], [IMAGE_3: ...] — place them at natural breakpoints after key sections
- Write content that is structured to appear in Google Featured Snippets, People Also Ask, and AI-generated search answers

## SNIPPET-FIRST WRITING RULES (Critical for Featured Snippets & AI Citations)
- Immediately after EVERY H2, write a direct, concise answer paragraph of 40-60 words. This is the paragraph Google pulls for Featured Snippets.
- Use "What is X?" H2 patterns for key terms — follow with a 1-2 sentence definition. This wins definition snippets.
- Include at least ONE markdown comparison table per article (e.g., destination comparison, package comparison, feature comparison). Tables win table snippets and are heavily cited by AI engines.
- Use numbered lists for "How to..." or "Steps to..." sections — these win list snippets.
- Write entity-rich content: explicitly mention named entities (brands, destinations, organizations like "UNWTO", "Saudi Tourism Authority", "Visit Dubai") so AI search engines can ground citations.

Topics you excel at: halal travel, Muslim-friendly destinations, luxury DMC services, B2B travel technology, destination guides, travel industry trends, hospitality tech, group travel, MICE tourism, cultural tourism.`;

function buildSystemPrompt(brandConfig?: any): string {
  let prompt = BASE_SYSTEM_PROMPT;

  if (brandConfig) {
    if (brandConfig.brand_tone) {
      prompt += `\n\nBrand Voice & Tone: ${brandConfig.brand_tone}`;
    }
    if (Array.isArray(brandConfig.target_audience) && brandConfig.target_audience.length) {
      prompt += `\n\nTarget Audience Personas:\n${brandConfig.target_audience.map((a: string) => `- ${a}`).join("\n")}`;
    }
    if (Array.isArray(brandConfig.target_regions) && brandConfig.target_regions.length) {
      prompt += `\n\nPrimary Target Regions: ${brandConfig.target_regions.join(", ")}`;
    }
    if (Array.isArray(brandConfig.brand_keywords) && brandConfig.brand_keywords.length) {
      prompt += `\n\nBrand Keywords to Incorporate: ${brandConfig.brand_keywords.join(", ")}`;
    }
    if (brandConfig.differentiators) {
      prompt += `\n\nKey Differentiators: ${brandConfig.differentiators}`;
    }
  }

  return prompt;
}

function buildCannibalizationContext(existingPosts: any[]): string {
  if (!existingPosts?.length) return "";
  const keywordMap = existingPosts
    .filter((p) => p.meta_keywords?.length || p.tags?.length)
    .map((p) => `- "${p.title}" targets: ${[...(p.meta_keywords || []), ...(p.tags || [])].join(", ")}`)
    .join("\n");
  if (!keywordMap) return "";
  return `\n\n## KEYWORD CANNIBALIZATION PREVENTION\nThe following keywords are already targeted by existing posts. You MUST differentiate this article's primary keywords and avoid directly competing with these:\n${keywordMap}\nChoose unique long-tail keywords and angles not covered by the existing content.`;
}

function buildExistingClustersContext(existingClusters: any[]): string {
  if (!existingClusters?.length) return "";

  const clusterBlocks = existingClusters.map((cluster) => {
    const name = cluster.name;
    const target = cluster.target_keyword;
    const description = cluster.description;
    const posts = cluster.posts || [];

    const pillar = posts.find((p: any) => p.post_type === "pillar");
    const supporting = posts.filter((p: any) => p.post_type === "supporting");

    const allKeywords = Array.from(
      new Set(
        posts.flatMap((p: any) => [
          ...(p.meta_keywords || []),
          ...(p.tags || []),
        ]),
      ),
    );

    const lines: string[] = [];
    lines.push(`Cluster "${name}" (target keyword: ${target})`);
    if (description) {
      lines.push(`  - Description: ${description}`);
    }
    if (pillar) {
      lines.push(`  - Pillar: "${pillar.title}"`);
    }
    if (supporting.length) {
      lines.push(
        `  - Supporting posts: ${supporting
          .map((p: any) => `"${p.title}"`)
          .join(", ")}`,
      );
    }
    if (allKeywords.length) {
      lines.push(
        `  - Keywords already targeted: ${allKeywords.join(", ")}`,
      );
    }
    return lines.join("\n");
  });

  return `\n\n## EXISTING CONTENT CLUSTERS (DO NOT DUPLICATE)\nYou are designing new content clusters/topics.\nYou MUST avoid duplicating existing cluster names, target keywords, or topics that clearly overlap with the clusters below.\nTreat keyword matches in a case-insensitive way and consider close variants (e.g. "halal travel guide" vs "guide to halal travel") as overlapping.\n\n${clusterBlocks.join(
    "\n\n",
  )}\n\nWhen suggesting new clusters or topics, prefer to:\n- Fill clear topical gaps\n- Suggest angles and long-tail keywords not already covered\n- Indicate when a proposed topic fits best into an EXISTING cluster instead of creating a new overlapping cluster.`;
}

function buildClusterContext(clusterInfo?: any): string {
  if (!clusterInfo) return "";
  let ctx = `\n\n## CONTENT CLUSTER CONTEXT`;
  ctx += `\nThis article is part of the "${clusterInfo.cluster_name}" content cluster (target keyword: "${clusterInfo.target_keyword}").`;
  if (clusterInfo.post_type === "pillar") {
    ctx += `\nThis is the PILLAR POST — it should be comprehensive, covering the topic broadly and linking to all supporting articles in the cluster.`;
  } else if (clusterInfo.post_type === "supporting") {
    ctx += `\nThis is a SUPPORTING POST — it should dive deep into a specific subtopic and link back to the pillar post: [${clusterInfo.pillar_title}](/blog/${clusterInfo.pillar_slug}).`;
  }
  if (clusterInfo.cluster_posts?.length) {
    ctx += `\nOther posts in this cluster:\n${clusterInfo.cluster_posts.map((p: any) => `- [${p.title}](/blog/${p.slug}) — ${p.post_type}`).join("\n")}`;
    ctx += `\nPrioritize linking to these cluster posts over other internal links.`;
  }
  return ctx;
}

async function handleError(response: Response): Promise<Response> {
  const status = response.status;
  if (status === 429) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (status === 402) {
    return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
      status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const t = await response.text();
  console.error("AI gateway error:", status, t);
  return new Response(JSON.stringify({ error: "AI gateway error" }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(apiKey: string, body: any): Promise<Response> {
  return await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    let reqBody: Record<string, any>;
    try {
      reqBody = (await req.json()) as Record<string, any>;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid or missing request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!reqBody || typeof reqBody.action !== "string") {
      return new Response(
        JSON.stringify({ error: "action is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured. Add it in Supabase Dashboard → Project Settings → Edge Functions → Secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const {
      action,
      title,
      content,
      topic,
      research,
      brandConfig,
      existingPosts,
      existingClusters,
      clusterInfo,
      prompts,
      categories,
      clusters,
    } = reqBody as Record<string, any>;
    const SYSTEM_PROMPT = buildSystemPrompt(brandConfig);
    let messages: { role: string; content: string }[] = [];
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    switch (action) {
      case "generate_article": {
        let researchContext = "";
        if (research) {
          if (research.serp_analysis?.content) {
            researchContext += `\n\n## SERP & Competitor Analysis (from real-time research):\n${research.serp_analysis.content}`;
          }
          if (research.industry_trends?.content) {
            researchContext += `\n\n## Industry Trends & Statistics:\n${research.industry_trends.content}`;
          }
          if (research.competitor_insights?.content) {
            researchContext += `\n\n## Competitor Content Insights:\n${research.competitor_insights.content}`;
          }
          if (research.brand_positioning?.content) {
            researchContext += `\n\n## Marhaba DMC Brand Positioning:\n${research.brand_positioning.content}`;
          }
          if (research.competition_landscape?.content) {
            researchContext += `\n\n## Global Competition Landscape:\n${research.competition_landscape.content}`;
          }
          // New: PAA & snippet data
          if (research.paa_snippets?.content) {
            researchContext += `\n\n## People Also Ask & Featured Snippet Data:\n${research.paa_snippets.content}`;
          }
          // New: AI engine citation patterns
          if (research.ai_citations?.content) {
            researchContext += `\n\n## AI Engine Citation Patterns (what ChatGPT/Gemini/Claude cite):\n${research.ai_citations.content}`;
          }
          if (Array.isArray(research.regional_insights) && research.regional_insights.length > 0) {
            researchContext += `\n\n## Regional Insights:\n`;
            for (const regionInfo of research.regional_insights) {
              if (!regionInfo?.region) continue;
              researchContext += `\n### ${regionInfo.region}\n`;
              if (regionInfo.serp_content) {
                researchContext += `\n**Regional SERP & Content:**\n${regionInfo.serp_content}\n`;
              }
              if (regionInfo.market_content) {
                researchContext += `\n**Regional Market & Demand:**\n${regionInfo.market_content}\n`;
              }
            }
          }
          researchContext += `\n\nTarget Region: ${research.targetRegion || "Global"}`;
          researchContext += `\nTarget Audience: ${research.targetAudience || "B2B travel agents"}`;

          // Include citation URLs for inline references
          const allCitations: string[] = [];
          for (const key of ["serp_analysis", "industry_trends", "competitor_insights", "brand_positioning", "paa_snippets", "ai_citations"]) {
            if (research[key]?.citations?.length) {
              allCitations.push(...research[key].citations);
            }
          }
          if (allCitations.length > 0) {
            researchContext += `\n\n## Source URLs for Inline Citations (use these as [Source](url) references in the article for E-E-A-T):\n${[...new Set(allCitations)].slice(0, 15).map((u: string) => `- ${u}`).join("\n")}`;
          }
        }

        let internalLinksContext = "";
        if (existingPosts?.length) {
          internalLinksContext = `\n\n## Available Internal Link Targets\nYou MUST naturally weave 3-7 internal links into the article using markdown link syntax. Only link where contextually relevant. Here are the available posts:\n${existingPosts.map((p: any) => `- [${p.title}](/blog/${p.slug}) — ${p.excerpt || p.category || ""}${p.tags?.length ? ` | Tags: ${p.tags.join(", ")}` : ""}`).join("\n")}\n\nUse the format [anchor text](/blog/slug) for internal links. Choose anchor text that is natural and descriptive, not "click here".`;
        }

        const cannibalizationCtx = buildCannibalizationContext(existingPosts);
        const clusterCtx = buildClusterContext(clusterInfo);

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Write a comprehensive, SEO-optimized blog article about: "${title || topic}".
${researchContext ? `\nUse the following real-time research to inform your writing — cite statistics, address content gaps identified, and differentiate from competitor angles. Use the source URLs provided to add inline citations [Source](url) for E-E-A-T signals:\n${researchContext}\n` : ""}${internalLinksContext}${cannibalizationCtx}${clusterCtx}

## REQUIRED ARTICLE STRUCTURE (follow this order for optimal UX, SEO, and AI citation)

1. **Introduction** (2-3 short paragraphs)
   - Open with a hook (question, statistic, or compelling claim)
   - State what the reader will learn and why it matters
   - Include the primary keyword naturally in the first 100 words

2. **Key Takeaways** (MANDATORY for all articles)
   - Add a brief bullet list of 4-6 main points right after the intro
   - Format: ## Key Takeaways followed by - bullet points
   - AI engines extract these as summaries — make them specific and data-rich

3. **Main body** (well-structured sections)
   - Use descriptive H2 headings (##) that include target keywords where natural
   - CRITICAL: Immediately after EVERY H2, write a direct answer paragraph (40-60 words) — this is what Google pulls for Featured Snippets
   - Use "What is X?" H2 pattern for at least one key term definition
   - Use H3 (###) for subsections
   - Keep paragraphs short (2-4 sentences max) for scannability
   - Include at least ONE markdown comparison table (e.g. | Feature | Option A | Option B |)
   - Include 3 image placement markers: [IMAGE_1: description], [IMAGE_2: description], [IMAGE_3: description]
   - 5-10 high-authority external links with inline citations [Source Name](url)
   ${existingPosts?.length ? "- 3-7 internal links to existing blog posts where contextually relevant" : ""}
   - Mention specific named entities (organizations, destinations, standards) for AI grounding

4. **Frequently Asked Questions**
   - ## Frequently Asked Questions
   - 3-5 questions as ### headings — use EXACT questions people search for (from PAA data if available)
   - Each answer must be 40-60 words (snippet-optimized length)
   - Format answers as direct, factual responses

5. **Conclusion**
   - Summarize key points in 2-3 sentences
   - Clear call to action (e.g. contact, sign up, explore more)

Make it ${clusterInfo?.post_type === "pillar" ? "2500-4000" : "1500-2500"} words. Use markdown throughout. Optimize for Featured Snippets, People Also Ask, and AI search engines (ChatGPT, Gemini, Claude, Perplexity).`,
          },
        ];
        break;
      }

      case "improve_content":
        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `You are an SEO and GSO optimization specialist. Audit and improve the following blog content for maximum visibility in Google Featured Snippets, People Also Ask, and AI search engines (ChatGPT, Gemini, Claude).

## AUDIT CHECKLIST — Fix ALL of these:

1. **Snippet Structure Audit**: Check every H2 heading. If it does NOT have a direct answer paragraph (40-60 words) immediately after it, ADD one. This is the #1 factor for Featured Snippet selection.

2. **Key Takeaways**: If missing, add a "## Key Takeaways" section with 4-6 bullet points right after the introduction. AI engines extract these as summaries.

3. **Entity Density Audit**: Ensure named entities (destinations, organizations like UNWTO, government tourism bodies, standards, brands) appear frequently. Add specific names where the content uses generic terms.

4. **Comparison Table**: If no markdown table exists, ADD at least one comparison or data table. Tables win table snippets and are heavily cited by AI engines.

5. **FAQ Optimization**: Ensure FAQ answers are exactly 40-60 words each (snippet-winning length). Rephrase questions to match how people actually search.

6. **Definition Patterns**: Ensure content includes at least one "What is X?" pattern with a 1-2 sentence definition for key terms.

7. **External Links**: Ensure 5-10 high-authority external links to credible sources exist. Add missing ones.

8. **Image Markers**: Ensure [IMAGE_1], [IMAGE_2], [IMAGE_3] markers are present at natural breakpoints.

9. **Cross-references**: Add "Related:" mentions between sections for better topical coverage signals.

10. **Inline Citations**: Where statistics or data points are mentioned, add source references as [Source](url).

Current content:
${content}

Return the COMPLETE improved version in markdown format. Do not explain changes — just return the improved content.`,
          },
        ];
        break;

      case "generate_meta": {
        const categoriesList = categories?.length
          ? `\n\nAvailable categories (pick the best-matching slug): ${categories.map((c: any) => `${c.name} (slug: ${c.slug})`).join(", ")}`
          : "";
        const clustersList = clusters?.length
          ? `\n\nAvailable content clusters (pick the best-matching cluster name if this article fits): ${clusters.map((c: any) => c.name).join(", ")}`
          : "";

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Based on this blog content, generate comprehensive SEO metadata, taxonomy, and search optimization fields:

Title: ${title}
Content: ${content?.substring(0, 3000)}
${categoriesList}
${clustersList}

Return ALL of the following:
1. meta_title (under 60 chars, include primary keyword)
2. meta_description (under 160 chars, include CTA and keyword)
3. meta_keywords (5-8 relevant SEO keywords)
4. category_slug: the slug of the best-matching category from the list above, or empty string
5. tags: 5-10 topic tags for filtering and discovery
6. suggested_cluster_name: best-matching content cluster name, or empty string
7. snippet_type: which Featured Snippet format this post should target — one of "definition", "list", "table", "paragraph", "video"
8. paa_target: the primary People Also Ask question this post directly answers
9. search_intent: classify as "informational", "commercial", "navigational", or "transactional"
10. primary_keyword: the single most important keyword this post targets`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "set_meta_tags",
              description: "Set comprehensive SEO metadata, taxonomy, and search optimization fields",
              parameters: {
                type: "object",
                properties: {
                  meta_title: { type: "string", description: "SEO meta title, under 60 characters" },
                  meta_description: { type: "string", description: "SEO meta description, under 160 characters" },
                  meta_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 relevant SEO keywords",
                  },
                  category_slug: { type: "string", description: "Slug of best-matching category, or empty if none fit" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-10 topic tags for filtering",
                  },
                  suggested_cluster_name: { type: "string", description: "Name of best-matching content cluster, or empty if none fit" },
                  snippet_type: { type: "string", enum: ["definition", "list", "table", "paragraph", "video"], description: "Target Featured Snippet format" },
                  paa_target: { type: "string", description: "Primary People Also Ask question this post answers" },
                  search_intent: { type: "string", enum: ["informational", "commercial", "navigational", "transactional"], description: "Search intent classification" },
                  primary_keyword: { type: "string", description: "The single most important keyword this post targets" },
                },
                required: ["meta_title", "meta_description", "meta_keywords", "category_slug", "tags", "suggested_cluster_name", "snippet_type", "paa_target", "search_intent", "primary_keyword"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "set_meta_tags" } };
        break;
      }

      case "generate_excerpt":
        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Write a compelling blog excerpt (2-3 sentences, max 200 characters) for this article:

Title: ${title}
Content: ${content?.substring(0, 1500)}

The excerpt should hook the reader and include a primary keyword naturally. Return ONLY the excerpt text, nothing else.`,
          },
        ];
        break;

      case "suggest_topics":
        {
          const cannibCtx = buildCannibalizationContext(existingPosts || []);
          const clustersCtx = buildExistingClustersContext(
            existingClusters || [],
          );
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.toLocaleString("en-US", { month: "long" });

          messages = [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Suggest 5 trending, SEO-friendly blog topics for Marhaba DMC's blog. Each topic should be highly searchable and relevant to halal travel, DMC services, or travel technology.

TODAY'S DATE: ${currentMonth} ${currentYear}. When suggesting topics that include a year or month (e.g. "Best Destinations 2025", "March Travel Guide"), ALWAYS use ${currentYear} and ${currentMonth} or the current/upcoming season. Do NOT use 2024 or any past year.

Consider current travel industry trends and seasonal relevance for ${currentMonth} ${currentYear}.

${clustersCtx}
${cannibCtx}

VERY IMPORTANT RULES:
- Do NOT suggest topics that meaningfully overlap with existing clusters or posts above.
- Avoid keyword cannibalization: if a primary keyword (or close variant) is already targeted, choose a different angle or long-tail variation.
- Prefer topics that clearly fill gaps in the current content portfolio, introduce new subtopics, or serve distinct search intents.`,
            },
          ];
        tools = [
          {
            type: "function",
            function: {
              name: "suggest_topics",
              description: "Return blog topic suggestions",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        keywords: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "description", "keywords"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topics"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "suggest_topics" } };
        break;
      }

      case "suggest_cluster": {
        const cannibCtx = buildCannibalizationContext(existingPosts || []);
        const clustersCtx = buildExistingClustersContext(
          existingClusters || [],
        );
        const nowCluster = new Date();
        const yearCluster = nowCluster.getFullYear();

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a content cluster strategy for the topic: "${
              title || topic
            }".
Current year: ${yearCluster}. When topic titles include a year, use ${yearCluster} only — never use past years like 2024.
${clustersCtx}
${cannibCtx}

Return a pillar post topic and 5-8 supporting post topics. Each supporting post should target a specific long-tail keyword that supports the pillar's main keyword.

CRITICAL CONSTRAINTS:
- Do NOT propose a new cluster whose name or target keyword is the same as, or clearly overlapping with, any existing cluster.
- Do NOT propose pillar or supporting topics that substantially duplicate existing topics or obviously compete for the same primary keyword.
- If the best strategy is to add new supporting topics under an EXISTING cluster instead of creating a new overlapping cluster, you should still propose a cluster plan but make sure the pillar/supporting topics are differentiated by angle, audience, or long-tail keyword.`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "suggest_cluster",
              description:
                "Return a content cluster plan with pillar and supporting topics",
              parameters: {
                type: "object",
                properties: {
                  cluster_name: {
                    type: "string",
                    description: "Name for the content cluster",
                  },
                  target_keyword: {
                    type: "string",
                    description: "Primary keyword for the cluster",
                  },
                  pillar: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      keywords: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "description", "keywords"],
                    additionalProperties: false,
                  },
                  supporting_posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        keywords: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "description", "keywords"],
                      additionalProperties: false,
                    },
                  },
                },
                required: [
                  "cluster_name",
                  "target_keyword",
                  "pillar",
                  "supporting_posts",
                ],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = {
          type: "function",
          function: { name: "suggest_cluster" },
        };
        break;
      }

      case "full_cluster_strategy": {
        const cannibCtx = buildCannibalizationContext(existingPosts || []);
        const clustersCtx = buildExistingClustersContext(
          existingClusters || [],
        );
        const now = new Date();
        const year = now.getFullYear();

        let researchContext = "";
        if (research) {
          if (research.niche_serp?.content) {
            researchContext +=
              `\n\n## NICHE SERP & INTENT BUCKETS:\n${research.niche_serp.content}`;
          }
          if (research.featured_snippets?.content) {
            researchContext +=
              `\n\n## FEATURED SNIPPET PATTERNS:\n${research.featured_snippets.content}`;
          }
          if (research.gso_citations?.content) {
            researchContext +=
              `\n\n## GSO / AI CITATION PATTERNS:\n${research.gso_citations.content}`;
          }
          if (research.competitor_clusters?.content) {
            researchContext +=
              `\n\n## COMPETITOR CLUSTER STRUCTURES:\n${research.competitor_clusters.content}`;
          }
          if (
            Array.isArray(research.regional_cluster_insights) &&
            research.regional_cluster_insights.length > 0
          ) {
            researchContext += `\n\n## REGIONAL CLUSTER INSIGHTS:\n`;
            for (const regionInfo of research.regional_cluster_insights) {
              if (!regionInfo?.region) continue;
              researchContext += `\n### ${regionInfo.region}\n`;
              if (regionInfo.serp_content) {
                researchContext +=
                  `\n**Regional SERP & Cluster Nuance:**\n${regionInfo.serp_content}\n`;
              }
            }
          }
        }

        const niche = topic || title || research?.niche || "your niche";

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `You are designing a COMPLETE content cluster architecture for the niche: "${niche}".
Current year: ${year}. When topic titles include a year, use ${year} only — never use past years like 2024.

Your goal is to create a non-overlapping set of clusters, pillar posts, and supporting posts that will establish #1 topical authority for this niche across:
- Traditional Google search (including Featured Snippets, People Also Ask, Related Searches)
- AI answer engines (ChatGPT, Gemini, Perplexity, Claude, etc.)

Use the following research and existing content context to avoid duplication and keyword cannibalization:
${researchContext}
${clustersCtx}
${cannibCtx}

CRITICAL RULES:
- Design ALL clusters in a single pass so you can avoid overlap between clusters and between posts.
- Each cluster must target a distinct, clearly separable subtopic or intent bucket for the niche.
- Within each cluster, the pillar post should be the authoritative hub, and supporting posts should cover well-defined long-tail or intent-specific queries.
- You MUST explicitly assign People Also Ask / Related Search questions and Featured Snippet targets to specific posts, so there is no cannibalization.

OUTPUT REQUIREMENTS:
- Design between 4 and 8 clusters in total.
- For each cluster, return:
  - cluster_name
  - target_keyword
  - description
  - paa_queries: a list of the top PAA-style questions that this cluster should own
  - related_searches: a list of the most important related searches for this cluster
  - featured_snippet_targets: a list of snippet opportunities (e.g. "What is halal travel? (definition)", "Halal travel checklist (list)", "Halal travel destinations table (table)")
  - pillar: title, description, keywords
  - supporting_posts: for each, return title, description, keywords, and optionally:
    - paa_target: the specific question (from paa_queries or related_searches) this post is designed to answer
    - snippet_type: one of "definition", "list", "table", "paragraph" if the post is optimized for a Featured Snippet.

Make sure:
- No two clusters use the same target_keyword or clearly overlapping primary angle.
- No two posts (pillar or supporting) are clearly competing for the same primary keyword or question.
- Prioritize coverage of commercially relevant and high-intent topics for a halal-friendly B2B DMC, while still covering important top-of-funnel educational content.`,
          },
        ];

        tools = [
          {
            type: "function",
            function: {
              name: "full_cluster_strategy",
              description:
                "Return a complete multi-cluster content strategy with GSO targets",
              parameters: {
                type: "object",
                properties: {
                  clusters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cluster_name: { type: "string" },
                        target_keyword: { type: "string" },
                        description: { type: "string" },
                        paa_queries: {
                          type: "array",
                          items: { type: "string" },
                        },
                        related_searches: {
                          type: "array",
                          items: { type: "string" },
                        },
                        featured_snippet_targets: {
                          type: "array",
                          items: { type: "string" },
                        },
                        pillar: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            keywords: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                          required: ["title", "description", "keywords"],
                          additionalProperties: false,
                        },
                        supporting_posts: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              description: { type: "string" },
                              keywords: {
                                type: "array",
                                items: { type: "string" },
                              },
                              paa_target: { type: "string" },
                              snippet_type: {
                                type: "string",
                                enum: [
                                  "definition",
                                  "list",
                                  "table",
                                  "paragraph",
                                ],
                              },
                            },
                            required: ["title", "description", "keywords"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: [
                        "cluster_name",
                        "target_keyword",
                        "description",
                        "pillar",
                        "supporting_posts",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["clusters"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = {
          type: "function",
          function: { name: "full_cluster_strategy" },
        };
        break;
      }

      case "check_cannibalization": {
        if (!existingPosts?.length || !title) {
          return new Response(JSON.stringify({ result: { overlaps: [], safe: true } }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        messages = [
          { role: "system", content: "You are an SEO keyword cannibalization analyst. Analyze whether a proposed blog post would compete with existing posts for the same keywords." },
          {
            role: "user",
            content: `Proposed article title: "${title}"\n\nExisting published articles:\n${existingPosts.map((p: any) => `- "${p.title}" | Keywords: ${[...(p.meta_keywords || []), ...(p.tags || [])].join(", ")}`).join("\n")}\n\nIdentify any keyword overlaps or cannibalization risks.`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "check_cannibalization",
              description: "Return keyword cannibalization analysis",
              parameters: {
                type: "object",
                properties: {
                  safe: { type: "boolean", description: "Whether it is safe to proceed" },
                  overlaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        keyword: { type: "string" },
                        competing_post: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                        suggestion: { type: "string" },
                      },
                      required: ["keyword", "competing_post", "severity", "suggestion"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["safe", "overlaps"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "check_cannibalization" } };
        break;
      }

      case "generate_image_prompts": {
        messages = [
          { role: "system", content: "You extract and create image generation prompts from blog content. You MUST always return exactly 4 images: 1 featured + 3 content images. For content images, use the EXACT [IMAGE_N: ...] marker strings from the content when present. If fewer than 3 markers exist, create prompts for the missing positions and use marker strings that will be injected (e.g. [IMAGE_2: topic] for the second section)." },
          {
            role: "user",
            content: `Extract and create image prompts from this blog content.\n\nTitle: ${title}\nContent: ${content?.substring(0, 4000)}\n\nReturn exactly 4 images:\n1. featured: Hero/cover image based on title and main topic\n2-4. content_images: Exactly 3 items. For each, use the EXACT [IMAGE_N: ...] marker from the content if it exists. If the content has fewer than 3 markers, create prompts for sections that need images and use marker format [IMAGE_1: topic], [IMAGE_2: topic], [IMAGE_3: topic] - the caller will ensure these markers exist.`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "extract_image_prompts",
              description: "Return image generation prompts and alt texts",
              parameters: {
                type: "object",
                properties: {
                  featured: {
                    type: "object",
                    properties: {
                      prompt: { type: "string", description: "Image generation prompt for featured/hero image" },
                      alt_text: { type: "string", description: "SEO-optimized alt text" },
                    },
                    required: ["prompt", "alt_text"],
                    additionalProperties: false,
                  },
                  content_images: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        marker: { type: "string", description: "The exact [IMAGE_N: ...] marker string from content to replace" },
                        prompt: { type: "string", description: "Image generation prompt" },
                        alt_text: { type: "string", description: "SEO-optimized alt text" },
                      },
                      required: ["marker", "prompt", "alt_text"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["featured", "content_images"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "extract_image_prompts" } };
        break;
      }

      case "suggest_competitors": {
        const regionsText =
          Array.isArray(brandConfig?.target_regions) && brandConfig.target_regions.length
            ? brandConfig.target_regions.join(", ")
            : "Middle East and Muslim-majority travel markets";
        const keywordsText =
          Array.isArray(brandConfig?.brand_keywords) && brandConfig.brand_keywords.length
            ? brandConfig.brand_keywords.join(", ")
            : "halal travel, DMC, Muslim-friendly travel, luxury hospitality, travel technology";

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Based on Marhaba DMC's positioning as a B2B halal-friendly Destination Management Company and the following configuration:

- Target regions: ${regionsText}
- Brand / service focus keywords: ${keywordsText}

Identify 5-10 relevant competitor companies whose BLOGS are useful benchmarks for content and SEO. These should be:
- B2B travel agencies, DMCs, or wholesalers
- Strong in halal travel, Muslim-friendly travel, or luxury/MICE travel for the same regions
- With active blogs or insights sections

Return ONLY their main blog or insights URLs as HTTPS links (one per entry).`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "suggest_competitors",
              description: "Return competitor blog URLs for research",
              parameters: {
                type: "object",
                properties: {
                  urls: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of competitor blog URLs (https://...)",
                  },
                },
                required: ["urls"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "suggest_competitors" } };
        break;
      }

      case "generate_images": {
        // Generate images using the Lovable AI image model
        const imagePrompts = prompts || [];
        
        // This action receives pre-extracted prompts and generates actual images
        const results: any[] = [];
        for (const p of imagePrompts) {
          try {
            const imgResp = await callAI(GEMINI_API_KEY, {
              model: "gemini-2.5-flash-preview-image-generation",
              messages: [{ role: "user", content: `Generate a professional, high-quality blog image: ${p.prompt}. Style: modern, clean, professional photography or illustration suitable for a travel industry blog. No text or watermarks.` }],
              modalities: ["image", "text"],
            });
            if (imgResp.ok) {
              const imgData = await imgResp.json();
              const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              if (imageUrl) {
                results.push({ ...p, image_base64: imageUrl });
              }
            }
          } catch (e) {
            console.error("Image generation error:", e);
          }
        }
        return new Response(JSON.stringify({ result: results, action }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "interlink_posts": {
        if (!existingPosts?.length || !content || !title) {
          return new Response(JSON.stringify({ error: "existingPosts, content, and title are required for interlinking" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const postsCatalog = existingPosts.map((p: any) => `- Title: "${p.title}" | Slug: /blog/${p.slug} | Excerpt: ${p.excerpt || "N/A"} | Tags: ${(p.tags || []).join(", ") || "N/A"}`).join("\n");

        messages = [
          { role: "system", content: `You are an SEO internal linking specialist. Your job is to analyze blog content and insert internal links to related articles where contextually relevant. Rules:\n- Add 3-7 internal links maximum\n- Use natural, descriptive anchor text (never "click here")\n- Only link where the context genuinely relates to the target article\n- Use markdown format: [anchor text](/blog/slug)\n- Do NOT change the meaning or structure of the content\n- Return the FULL updated content with links inserted` },
          {
            role: "user",
            content: `Here is a blog post titled "${title}":\n\n${content}\n\n---\n\nHere are all available internal link targets:\n${postsCatalog}\n\nInsert relevant internal links into the content above. Return the complete updated content with links naturally woven in.`,
          },
        ];
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action", received: action }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }

    const aiBody: any = {
      model: "gemini-2.5-flash",
      messages,
    };
    if (tools) aiBody.tools = tools;
    if (tool_choice) aiBody.tool_choice = tool_choice;

    // For article generation, use streaming
    if (action === "generate_article" || action === "improve_content" || action === "interlink_posts") {
      aiBody.stream = true;
      const response = await callAI(LOVABLE_API_KEY, aiBody);

      if (!response.ok) return handleError(response);

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming for structured outputs
    const response = await callAI(LOVABLE_API_KEY, aiBody);

    if (!response.ok) return handleError(response);

    const data = await response.json();
    const choice = data.choices?.[0];

    // Handle tool calls
    if (choice?.message?.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ result: args, action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle plain text
    return new Response(
      JSON.stringify({ result: choice?.message?.content || "", action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("blog-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
