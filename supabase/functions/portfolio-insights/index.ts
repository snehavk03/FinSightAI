import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holding {
  asset_name: string;
  asset_symbol: string;
  asset_type: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  sector: string | null;
  value: number;
  pnlPercent: number;
}

interface PortfolioData {
  holdings: Holding[];
  sectorAllocation: { name: string; value: number }[];
  totalValue: number;
  totalPnlPercent: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { holdings, sectorAllocation, totalValue, totalPnlPercent } = await req.json() as PortfolioData;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!holdings || holdings.length === 0) {
      return new Response(JSON.stringify({ 
        insights: [{
          type: 'info',
          title: 'Start Your Investment Journey',
          description: 'Add your first holdings to get personalized AI-powered portfolio insights and recommendations.',
          priority: 'low'
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare portfolio summary for AI
    const portfolioSummary = `
Portfolio Analysis Request:

**Total Portfolio Value:** ₹${totalValue.toLocaleString('en-IN')}
**Overall Returns:** ${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%

**Holdings (${holdings.length} assets):**
${holdings.map(h => `- ${h.asset_name} (${h.asset_symbol}): ₹${h.value.toLocaleString('en-IN')} | ${h.asset_type} | Sector: ${h.sector || 'Unspecified'} | Returns: ${h.pnlPercent >= 0 ? '+' : ''}${h.pnlPercent.toFixed(2)}%`).join('\n')}

**Sector Allocation:**
${sectorAllocation.map(s => `- ${s.name}: ${s.value}%`).join('\n')}

**Asset Type Breakdown:**
${Object.entries(holdings.reduce((acc, h) => {
  acc[h.asset_type] = (acc[h.asset_type] || 0) + h.value;
  return acc;
}, {} as Record<string, number>)).map(([type, value]) => `- ${type}: ₹${value.toLocaleString('en-IN')} (${((value / totalValue) * 100).toFixed(1)}%)`).join('\n')}
`;

    const systemPrompt = `You are an expert Indian financial advisor AI. Analyze the user's portfolio and provide 3 actionable insights.

Rules:
1. Speak in simple, friendly Hindi-English mix that Indian retail investors understand
2. Use ₹ for amounts and explain in lakhs/crores when appropriate
3. Focus on: diversification gaps, concentration risks, rebalancing needs, and opportunities
4. Be specific with numbers from their portfolio
5. Each insight should have a clear action item
6. Consider Indian market context (NSE/BSE, Indian sectors, tax rules like LTCG/STCG)

Respond ONLY with a valid JSON array of exactly 3 insights in this format:
[
  {
    "type": "alert|suggestion|opportunity",
    "title": "Brief title (max 5 words)",
    "description": "Clear explanation with specific numbers and action (2-3 sentences max)",
    "priority": "high|medium|low"
  }
]

Priority guide:
- high: Immediate action needed (concentration risk >40%, severe imbalance)
- medium: Should address soon (minor rebalancing, missed opportunities)  
- low: Good to know (tax tips, small optimizations)`;

    console.log('Calling Gemini for portfolio insights...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: portfolioSummary }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('Gemini response:', content);

    // Parse JSON from response
    let insights;
    try {
      // Extract JSON array from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      // Fallback insights
      insights = [{
        type: 'suggestion',
        title: 'Portfolio Review',
        description: 'Your portfolio is being analyzed. Check back in a moment for personalized insights.',
        priority: 'low'
      }];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in portfolio-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      insights: [{
        type: 'alert',
        title: 'Analysis Unavailable',
        description: 'Unable to analyze portfolio at this time. Please try again later.',
        priority: 'low'
      }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
