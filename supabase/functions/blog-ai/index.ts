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
- Optimized for both traditional SEO and AI-powered generative search engines
- Each article should include an FAQ section at the end with 3-5 questions for GSO snippets
- Use markdown formatting for all content
- Target 1200-2000 words for full articles
- Include internal linking suggestions where relevant
- Focus on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { action, title, content, topic, research, brandConfig } = await req.json();
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

        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Write a comprehensive, SEO-optimized blog article about: "${title || topic}".
${researchContext ? `\nUse the following real-time research to inform your writing — cite statistics, address content gaps identified, and differentiate from competitor angles:\n${researchContext}\n` : ""}
Include:
1. An engaging introduction with a hook
2. Well-structured sections with H2/H3 headings (use ## and ### markdown)
3. Practical tips, statistics, or examples where relevant${research ? " (use the research data provided)" : ""}
4. A FAQ section at the end with 3-5 questions and concise answers
5. A compelling conclusion with a call to action

Make it 1500-2000 words. Use markdown formatting throughout.`,
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

Current content:
${content}

Return the improved version in markdown format.`,
          },
        ];
        break;

      case "generate_meta":
        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Based on this blog content, generate optimized SEO meta tags:

Title: ${title}
Content: ${content?.substring(0, 2000)}

Generate a meta title (under 60 chars), meta description (under 160 chars), and 5-8 relevant keywords.`,
          },
        ];
        tools = [
          {
            type: "function",
            function: {
              name: "set_meta_tags",
              description: "Set the SEO meta tags for the blog post",
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
                },
                required: ["meta_title", "meta_description", "meta_keywords"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "set_meta_tags" } };
        break;

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
        messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Suggest 5 trending, SEO-friendly blog topics for Marhaba DMC's blog. Each topic should be highly searchable and relevant to halal travel, DMC services, or travel technology.

Consider current travel industry trends and seasonal relevance.`,
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
    if (action === "generate_article" || action === "improve_content") {
      body.stream = true;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming for structured outputs
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
