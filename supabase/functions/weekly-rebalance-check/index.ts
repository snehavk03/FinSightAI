import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holding {
  asset_symbol: string;
  asset_name: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  sector: string | null;
  user_id: string;
}

interface UserPortfolio {
  user_id: string;
  holdings: Holding[];
  totalValue: number;
  sectorAllocation: Record<string, number>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting weekly rebalance check...');

    // Get all holdings grouped by user
    const { data: allHoldings, error: holdingsError } = await supabase
      .from('holdings')
      .select('*');

    if (holdingsError) {
      throw new Error(`Failed to fetch holdings: ${holdingsError.message}`);
    }

    if (!allHoldings || allHoldings.length === 0) {
      console.log('No holdings found');
      return new Response(
        JSON.stringify({ success: true, message: 'No holdings to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group holdings by user
    const userPortfolios: Map<string, UserPortfolio> = new Map();
    
    for (const holding of allHoldings) {
      const userId = holding.user_id;
      if (!userPortfolios.has(userId)) {
        userPortfolios.set(userId, {
          user_id: userId,
          holdings: [],
          totalValue: 0,
          sectorAllocation: {}
        });
      }
      
      const portfolio = userPortfolios.get(userId)!;
      portfolio.holdings.push(holding);
      
      const value = holding.quantity * holding.current_price;
      portfolio.totalValue += value;
      
      const sector = holding.sector || 'Other';
      portfolio.sectorAllocation[sector] = (portfolio.sectorAllocation[sector] || 0) + value;
    }

    const rebalanceRecommendations: Array<{ user_id: string; recommendations: string[] }> = [];

    // Analyze each user's portfolio for rebalancing needs
    for (const [userId, portfolio] of userPortfolios) {
      const recommendations: string[] = [];
      
      // Check for concentration risk (any sector > 40%)
      for (const [sector, value] of Object.entries(portfolio.sectorAllocation)) {
        const percentage = (value / portfolio.totalValue) * 100;
        if (percentage > 40) {
          recommendations.push(`High concentration in ${sector} (${percentage.toFixed(1)}%). Consider diversifying.`);
        }
      }

      // Check for individual stock concentration (any stock > 25% of portfolio)
      for (const holding of portfolio.holdings) {
        const stockValue = holding.quantity * holding.current_price;
        const percentage = (stockValue / portfolio.totalValue) * 100;
        if (percentage > 25) {
          recommendations.push(`${holding.asset_symbol} represents ${percentage.toFixed(1)}% of portfolio. Consider trimming.`);
        }
      }

      // Check for underperforming positions (loss > 20%)
      for (const holding of portfolio.holdings) {
        const pnlPercent = ((holding.current_price - holding.buy_price) / holding.buy_price) * 100;
        if (pnlPercent < -20) {
          recommendations.push(`${holding.asset_symbol} is down ${Math.abs(pnlPercent).toFixed(1)}%. Review for potential exit.`);
        }
      }

      // Check for sector diversity
      const sectorCount = Object.keys(portfolio.sectorAllocation).length;
      if (sectorCount < 3 && portfolio.holdings.length >= 3) {
        recommendations.push(`Portfolio spans only ${sectorCount} sector(s). Consider adding more sectors.`);
      }

      if (recommendations.length > 0) {
        rebalanceRecommendations.push({ user_id: userId, recommendations });
        console.log(`User ${userId.slice(0, 8)}... has ${recommendations.length} rebalance recommendations`);
      }
    }

    // Use Gemini to generate a summary if we have recommendations
    let aiSummary = null;
    if (LOVABLE_API_KEY && rebalanceRecommendations.length > 0) {
      try {
        const prompt = `You are a portfolio analyst. Summarize these rebalancing recommendations in a brief, actionable format:

${JSON.stringify(rebalanceRecommendations, null, 2)}

Provide a 2-3 sentence summary of the key rebalancing themes across all portfolios.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiSummary = aiData.choices?.[0]?.message?.content;
        }
      } catch (e) {
        console.error('AI summary failed:', e);
      }
    }

    console.log(`Weekly rebalance check complete. ${rebalanceRecommendations.length} portfolios need attention.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        portfoliosAnalyzed: userPortfolios.size,
        portfoliosNeedingRebalance: rebalanceRecommendations.length,
        recommendations: rebalanceRecommendations,
        aiSummary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weekly-rebalance-check:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
