import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting monthly AI summary report generation...');

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
        JSON.stringify({ success: true, message: 'No holdings to report on' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group holdings by user and calculate metrics
    const userReports: Map<string, any> = new Map();
    
    for (const holding of allHoldings) {
      const userId = holding.user_id;
      if (!userReports.has(userId)) {
        userReports.set(userId, {
          user_id: userId,
          holdings: [],
          totalValue: 0,
          totalInvested: 0,
          sectorAllocation: {},
          topPerformers: [],
          bottomPerformers: []
        });
      }
      
      const report = userReports.get(userId)!;
      const value = holding.quantity * holding.current_price;
      const invested = holding.quantity * holding.buy_price;
      const pnl = value - invested;
      const pnlPercent = ((holding.current_price - holding.buy_price) / holding.buy_price) * 100;
      
      report.holdings.push({
        symbol: holding.asset_symbol,
        name: holding.asset_name,
        value,
        invested,
        pnl,
        pnlPercent,
        sector: holding.sector || 'Other'
      });
      
      report.totalValue += value;
      report.totalInvested += invested;
      
      const sector = holding.sector || 'Other';
      report.sectorAllocation[sector] = (report.sectorAllocation[sector] || 0) + value;
    }

    // Generate AI summaries for each user
    const generatedReports: Array<{ user_id: string; summary: string }> = [];

    for (const [userId, report] of userReports) {
      // Sort holdings by P&L percentage
      const sortedHoldings = [...report.holdings].sort((a, b) => b.pnlPercent - a.pnlPercent);
      report.topPerformers = sortedHoldings.slice(0, 3);
      report.bottomPerformers = sortedHoldings.slice(-3).reverse();

      const totalPnl = report.totalValue - report.totalInvested;
      const totalPnlPercent = ((report.totalValue - report.totalInvested) / report.totalInvested) * 100;

      // Convert sector allocation to percentages
      const sectorBreakdown = Object.entries(report.sectorAllocation)
        .map(([sector, value]) => ({
          sector,
          value: value as number,
          percentage: ((value as number) / report.totalValue * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

      const prompt = `You are a friendly financial advisor for Indian retail investors. Generate a comprehensive monthly portfolio summary report.

PORTFOLIO OVERVIEW:
- Total Portfolio Value: ₹${report.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
- Total Invested: ₹${report.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
- Overall P&L: ₹${totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%)
- Number of Holdings: ${report.holdings.length}

SECTOR ALLOCATION:
${sectorBreakdown.map(s => `- ${s.sector}: ${s.percentage}%`).join('\n')}

TOP PERFORMERS:
${report.topPerformers.map((h: any) => `- ${h.symbol}: ${h.pnlPercent >= 0 ? '+' : ''}${h.pnlPercent.toFixed(2)}%`).join('\n')}

BOTTOM PERFORMERS:
${report.bottomPerformers.map((h: any) => `- ${h.symbol}: ${h.pnlPercent >= 0 ? '+' : ''}${h.pnlPercent.toFixed(2)}%`).join('\n')}

Generate a monthly summary report that includes:
1. Portfolio health assessment (2-3 sentences)
2. Key highlights from the month
3. Areas of concern if any
4. Action items for next month (2-3 specific recommendations)
5. Motivational closing note

Use simple language suitable for Indian retail investors. Keep it concise but comprehensive (max 300 words).`;

      try {
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
          const summary = aiData.choices?.[0]?.message?.content || 'Report generation failed';
          
          generatedReports.push({
            user_id: userId,
            summary
          });
          
          console.log(`Generated report for user ${userId.slice(0, 8)}...`);
        } else {
          console.error(`AI response error for user ${userId}:`, aiResponse.status);
        }
      } catch (e) {
        console.error(`Failed to generate report for user ${userId}:`, e);
      }
    }

    console.log(`Monthly report generation complete. Generated ${generatedReports.length} reports.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportsGenerated: generatedReports.length,
        reports: generatedReports
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monthly-ai-summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
