import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
- Target 1500-2500 words for full articles
- Include 5-10 high-authority external links to credible sources (government tourism boards like visitdubai.com, unwto.org, Wikipedia for factual claims, industry reports). Use markdown links: [anchor text](url)
- Focus on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Include image placement markers in the content: [IMAGE_1: descriptive prompt for image], [IMAGE_2: ...], [IMAGE_3: ...] — place them at natural breakpoints after key sections
- Write content that is structured to appear in Google Featured Snippets, People Also Ask, and AI-generated search answers

Topics you excel at: halal travel, Muslim-friendly destinations, luxury DMC services, B2B travel technology, destination guides, travel industry trends, hospitality tech, group travel, MICE tourism, cultural tourism.`;

function buildSystemPrompt(brandConfig?: any): string {
  let prompt = BASE_SYSTEM_PROMPT;

  if (brandConfig) {
    if (brandConfig.brand_tone) {
      prompt += `\n\nBrand Voice & Tone: ${brandConfig.brand_tone}`;
    }
    if (brandConfig.target_audience?.length) {
      prompt += `\n\nTarget Audience Personas:\n${brandConfig.target_audience.map((a: string) => `- ${a}`).join("\n")}`;
    }
    if (brandConfig.target_regions?.length) {
      prompt += `\n\nPrimary Target Regions: ${brandConfig.target_regions.join(", ")}`;
    }
    if (brandConfig.brand_keywords?.length) {
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
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
    } = await req.json();
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
          researchContext += `\n\nTarget Region: ${research.targetRegion || "Global"}`;
          researchContext += `\nTarget Audience: ${research.targetAudience || "B2B travel agents"}`;
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
${researchContext ? `\nUse the following real-time research to inform your writing — cite statistics, address content gaps identified, and differentiate from competitor angles:\n${researchContext}\n` : ""}${internalLinksContext}${cannibalizationCtx}${clusterCtx}

## REQUIRED ARTICLE STRUCTURE (follow this order for optimal UX and SEO)

1. **Introduction** (2-3 short paragraphs)
   - Open with a hook (question, statistic, or compelling claim)
   - State what the reader will learn and why it matters
   - Include the primary keyword naturally in the first 100 words

2. **Key Takeaways** (optional but recommended for articles over 1200 words)
   - Add a brief bullet list of 3-5 main points right after the intro
   - Format: ## Key Takeaways followed by - bullet points
   - Helps scanners and improves time-on-page

3. **Main body** (well-structured sections)
   - Use descriptive H2 headings (##) that include target keywords where natural
   - Use H3 (###) for subsections
   - Keep paragraphs short (2-4 sentences max) for scannability
   - Include 3 image placement markers: [IMAGE_1: description], [IMAGE_2: description], [IMAGE_3: description] — place after key sections, not all at the end
   - 5-10 high-authority external links to credible sources (government tourism sites, unwto.org, Wikipedia)
   ${existingPosts?.length ? "- 3-7 internal links to existing blog posts where contextually relevant" : ""}

4. **Frequently Asked Questions**
   - ## Frequently Asked Questions
   - 3-5 questions as ### headings with concise answers (optimized for Featured Snippets and PAA)
   - Use question format people actually search for

5. **Conclusion**
   - Summarize key points
   - Clear call to action (e.g. contact, sign up, explore more)

Make it 1500-2500 words. Use markdown throughout. Optimize for Featured Snippets, People Also Ask, and AI search.`,
          },
        ];
        break;
      }

      case "improve_content":
        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Improve the following blog content for better SEO, readability, and engagement. Maintain the core message but enhance the structure, add relevant keywords naturally, improve transitions, and ensure it follows GSO best practices.

Ensure the content includes:
- 5-10 high-authority external links to credible sources
- Image placement markers [IMAGE_1: description], [IMAGE_2: description], [IMAGE_3: description] if not already present
- An FAQ section formatted with ### headings if not already present
- Content structured for Featured Snippets and People Also Ask

Current content:
${content}

Return the improved version in markdown format.`,
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
            content: `Based on this blog content, generate full SEO metadata and taxonomy:

Title: ${title}
Content: ${content?.substring(0, 2500)}
${categoriesList}
${clustersList}

Return:
1. meta_title (under 60 chars)
2. meta_description (under 160 chars)
3. meta_keywords (5-8 relevant SEO keywords)
4. category_slug: the slug of the best-matching category from the list above, or empty string if none fit
5. tags: 5-10 topic tags for filtering and discovery (can overlap with meta_keywords but add broader terms)
6. suggested_cluster_name: the name of the best-matching content cluster from the list above, or empty string if none fit`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "set_meta_tags",
              description: "Set full SEO metadata and taxonomy for the blog post",
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
                },
                required: ["meta_title", "meta_description", "meta_keywords", "category_slug", "tags", "suggested_cluster_name"],
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
            content: `Create a content cluster strategy for the topic: "${title || topic}".
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
              description: "Return a content cluster plan with pillar and supporting topics",
              parameters: {
                type: "object",
                properties: {
                  cluster_name: { type: "string", description: "Name for the content cluster" },
                  target_keyword: { type: "string", description: "Primary keyword for the cluster" },
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
                required: ["cluster_name", "target_keyword", "pillar", "supporting_posts"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "suggest_cluster" } };
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
          { role: "system", content: "You extract image generation prompts from blog content. For each [IMAGE_N: description] marker found, create an optimized image generation prompt." },
          {
            role: "user",
            content: `Extract and enhance image prompts from this blog content. Also generate a featured image prompt based on the title.\n\nTitle: ${title}\nContent: ${content?.substring(0, 3000)}\n\nReturn prompts for: 1 featured image + up to 3 in-content images found in [IMAGE_N:] markers.`,
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
                    items: {
                      type: "object",
                      properties: {
                        marker: { type: "string", description: "The original [IMAGE_N: ...] marker to replace" },
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
        const regionsText = brandConfig?.target_regions?.length
          ? brandConfig.target_regions.join(", ")
          : "Middle East and Muslim-majority travel markets";
        const keywordsText = brandConfig?.brand_keywords?.length
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
            const imgResp = await callAI(LOVABLE_API_KEY, {
              model: "google/gemini-2.5-flash-image",
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
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages,
    };
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;

    // For article generation, use streaming
    if (action === "generate_article" || action === "improve_content" || action === "interlink_posts") {
      body.stream = true;
      const response = await callAI(LOVABLE_API_KEY, body);

      if (!response.ok) return handleError(response);

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming for structured outputs
    const response = await callAI(LOVABLE_API_KEY, body);

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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("blog-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
