import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache with TTL
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface StockPrice {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  error?: string;
}

async function fetchYahooPrice(symbol: string): Promise<StockPrice> {
  // Check cache first
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for ${symbol}: ${cached.price}`);
    return { symbol, price: cached.price, change: null, changePercent: null };
  }

  // NSE stocks use .NS suffix in Yahoo Finance
  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
    console.log(`Fetching price for ${yahooSymbol} from Yahoo Finance`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Yahoo API error for ${symbol}: ${response.status}`);
      return { symbol, price: null, change: null, changePercent: null, error: 'API error' };
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) {
      console.error(`No data for ${symbol}`);
      return { symbol, price: null, change: null, changePercent: null, error: 'No data' };
    }

    const meta = result.meta;
    const currentPrice = meta?.regularMarketPrice ?? null;
    const previousClose = meta?.previousClose ?? meta?.chartPreviousClose ?? null;
    
    let change = null;
    let changePercent = null;
    
    if (currentPrice && previousClose) {
      change = currentPrice - previousClose;
      changePercent = (change / previousClose) * 100;
    }

    // Cache the result
    if (currentPrice) {
      priceCache.set(symbol, { price: currentPrice, timestamp: Date.now() });
      console.log(`Cached price for ${symbol}: ${currentPrice}`);
    }

    return { symbol, price: currentPrice, change, changePercent };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return { symbol, price: null, change: null, changePercent: null, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'symbols array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit to 50 symbols per request
    const limitedSymbols = symbols.slice(0, 50);
    console.log(`Fetching prices for ${limitedSymbols.length} symbols`);

    // Fetch all prices in parallel
    const prices = await Promise.all(limitedSymbols.map(fetchYahooPrice));

    return new Response(
      JSON.stringify({ prices, cacheInfo: { ttlMs: CACHE_TTL_MS } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
