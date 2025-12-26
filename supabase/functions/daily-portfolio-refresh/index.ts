import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Price cache to avoid excessive API calls
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily portfolio refresh...');

    // Get all unique stock symbols from holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('id, asset_symbol, asset_type')
      .in('asset_type', ['stock', 'etf']);

    if (holdingsError) {
      throw new Error(`Failed to fetch holdings: ${holdingsError.message}`);
    }

    if (!holdings || holdings.length === 0) {
      console.log('No stock/ETF holdings found');
      return new Response(
        JSON.stringify({ success: true, message: 'No holdings to refresh' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique symbols
    const uniqueSymbols = [...new Set(holdings.map(h => h.asset_symbol))];
    console.log(`Refreshing prices for ${uniqueSymbols.length} symbols:`, uniqueSymbols);

    // Fetch prices for each symbol
    const prices: Record<string, number> = {};
    
    for (const symbol of uniqueSymbols) {
      try {
        // Check cache first
        const cached = priceCache.get(symbol);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          prices[symbol] = cached.price;
          continue;
        }

        // Fetch from Yahoo Finance
        const yahooSymbol = `${symbol}.NS`;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
        
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.ok) {
          const data = await response.json();
          const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          
          if (price) {
            prices[symbol] = price;
            priceCache.set(symbol, { price, timestamp: Date.now() });
            console.log(`${symbol}: ₹${price}`);
          }
        }
      } catch (e) {
        console.error(`Failed to fetch price for ${symbol}:`, e);
      }
    }

    // Update holdings with new prices
    let updatedCount = 0;
    for (const holding of holdings) {
      const newPrice = prices[holding.asset_symbol];
      if (newPrice) {
        const { error } = await supabase
          .from('holdings')
          .update({ current_price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', holding.id);

        if (!error) {
          updatedCount++;
        }
      }
    }

    console.log(`Daily refresh complete. Updated ${updatedCount} holdings.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Refreshed ${updatedCount} holdings`,
        symbolsProcessed: uniqueSymbols.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-portfolio-refresh:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
