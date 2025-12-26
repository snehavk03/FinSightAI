import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache for news to avoid excessive API calls
const newsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface Holding {
  asset_symbol: string;
  asset_name: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  sector: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { holdings } = await req.json() as { holdings: Holding[] };
    
    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({ news: [], message: "No holdings to fetch news for" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const symbols = holdings.map(h => h.asset_symbol);
    const cacheKey = symbols.sort().join(',');
    
    // Check cache
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached news');
      return new Response(
        JSON.stringify({ news: cached.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch news for each symbol using Google News RSS (free, no API key needed)
    const allNewsItems: any[] = [];
    
    for (const symbol of symbols.slice(0, 5)) { // Limit to 5 stocks to avoid rate limits
      try {
        // Use Google News RSS for Indian stocks
        const searchQuery = encodeURIComponent(`${symbol} NSE stock India`);
        const rssUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=en-IN&gl=IN&ceid=IN:en`;
        
        const response = await fetch(rssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.ok) {
          const xml = await response.text();
          
          // Parse RSS XML to extract news items
          const items = parseRssItems(xml, symbol);
          allNewsItems.push(...items.slice(0, 2)); // Max 2 news per stock
        }
      } catch (e) {
        console.log(`Failed to fetch news for ${symbol}:`, e);
      }
    }

    if (allNewsItems.length === 0) {
      return new Response(
        JSON.stringify({ news: [], message: "No recent news found for your holdings" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Gemini to analyze and summarize news
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create holding context for AI
    const holdingContext = holdings.map(h => ({
      symbol: h.asset_symbol,
      name: h.asset_name,
      quantity: h.quantity,
      value: h.quantity * h.current_price,
      pnlPercent: ((h.current_price - h.buy_price) / h.buy_price * 100).toFixed(2)
    }));

    const prompt = `You are an AI financial analyst helping an Indian retail investor understand news about their portfolio holdings.

USER'S PORTFOLIO:
${JSON.stringify(holdingContext, null, 2)}

NEWS ITEMS TO ANALYZE:
${JSON.stringify(allNewsItems, null, 2)}

For each news item, provide a JSON response with this exact structure:
{
  "news": [
    {
      "id": 1,
      "title": "Original or slightly improved title",
      "summary": "2-3 sentence summary in simple language",
      "source": "Source name",
      "time": "relative time like '2 hours ago'",
      "sentiment": "bullish" | "bearish" | "neutral",
      "stocks": ["SYMBOL"],
      "impact": "Brief market impact statement",
      "aiInsight": "Personalized insight for THIS investor based on their holdings, quantity, and current P&L. Be specific about their position.",
      "action": "Hold" | "Watch" | "Reduce"
    }
  ]
}

Guidelines:
- Use simple language an Indian retail investor would understand
- Reference the user's actual holdings when giving insights (e.g., "Your 50 shares of TCS...")
- Be balanced and factual, not overly promotional
- Consider both short-term and long-term implications
- Action should be: Hold (positive/stable), Watch (needs monitoring), Reduce (concerning)

Return ONLY valid JSON, no markdown or explanation.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", news: [] }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse AI response
    let analyzedNews = [];
    try {
      // Clean the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedContent);
      analyzedNews = parsed.news || [];
    } catch (e) {
      console.error("Failed to parse AI response:", e, content);
      // Return raw news if AI parsing fails
      analyzedNews = allNewsItems.map((item, idx) => ({
        id: idx + 1,
        title: item.title,
        summary: item.description || item.title,
        source: item.source,
        time: item.pubDate,
        sentiment: 'neutral' as const,
        stocks: [item.symbol],
        impact: "News may affect this stock",
        aiInsight: "Analysis unavailable at this time.",
        action: 'Watch' as const
      }));
    }

    // Cache the results
    newsCache.set(cacheKey, { data: analyzedNews, timestamp: Date.now() });

    return new Response(
      JSON.stringify({ news: analyzedNews }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in portfolio-news function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", news: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseRssItems(xml: string, symbol: string): any[] {
  const items: any[] = [];
  
  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const source = extractTag(itemXml, 'source') || 'Google News';
    const description = extractTag(itemXml, 'description');
    
    if (title) {
      items.push({
        title: decodeHtmlEntities(title),
        link,
        pubDate: formatRelativeTime(pubDate),
        source: decodeHtmlEntities(source),
        description: cleanDescription(description),
        symbol
      });
    }
  }
  
  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`);
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function cleanDescription(desc: string): string {
  // Remove HTML tags and clean up
  return desc.replace(/<[^>]*>/g, '').trim().substring(0, 300);
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN');
  } catch {
    return 'Recently';
  }
}
