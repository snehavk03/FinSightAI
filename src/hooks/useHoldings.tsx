import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Holding {
  id: string;
  asset_name: string;
  asset_symbol: string;
  asset_type: 'stock' | 'mutual_fund' | 'etf' | 'debt';
  quantity: number;
  buy_price: number;
  current_price: number;
  sector: string | null;
  created_at: string;
  updated_at: string;
}

export interface HoldingWithCalculations extends Holding {
  value: number;
  pnl: number;
  pnlPercent: number;
  priceLoading?: boolean;
}

// Local cache for prices
const localPriceCache = new Map<string, { price: number; timestamp: number }>();
const LOCAL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useHoldings() {
  const [holdings, setHoldings] = useState<HoldingWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateHolding = (h: Holding): HoldingWithCalculations => {
    const value = Number(h.quantity) * Number(h.current_price);
    const invested = Number(h.quantity) * Number(h.buy_price);
    const pnl = value - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    
    return {
      ...h,
      quantity: Number(h.quantity),
      buy_price: Number(h.buy_price),
      current_price: Number(h.current_price),
      value,
      pnl,
      pnlPercent,
    };
  };

  const fetchPrices = useCallback(async (symbols: string[]): Promise<Map<string, number>> => {
    const prices = new Map<string, number>();
    const symbolsToFetch: string[] = [];

    // Check local cache first
    for (const symbol of symbols) {
      const cached = localPriceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < LOCAL_CACHE_TTL) {
        prices.set(symbol, cached.price);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    if (symbolsToFetch.length === 0) {
      return prices;
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-prices', {
        body: { symbols: symbolsToFetch },
      });

      if (error) {
        console.error('Error fetching prices:', error);
        return prices;
      }

      if (data?.prices) {
        for (const priceData of data.prices) {
          if (priceData.price !== null) {
            prices.set(priceData.symbol, priceData.price);
            localPriceCache.set(priceData.symbol, { 
              price: priceData.price, 
              timestamp: Date.now() 
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calling price service:', error);
    }

    return prices;
  }, []);

  const updateHoldingPrices = useCallback(async (currentHoldings: HoldingWithCalculations[]) => {
    if (currentHoldings.length === 0) return;

    // Only fetch prices for stocks and ETFs
    const stockSymbols = currentHoldings
      .filter(h => h.asset_type === 'stock' || h.asset_type === 'etf')
      .map(h => h.asset_symbol);

    if (stockSymbols.length === 0) return;

    setPricesLoading(true);
    const prices = await fetchPrices(stockSymbols);

    if (prices.size > 0) {
      // Update holdings with new prices
      const updatedHoldings = currentHoldings.map(h => {
        const newPrice = prices.get(h.asset_symbol);
        if (newPrice && newPrice !== h.current_price) {
          // Update in database silently
          supabase
            .from('holdings')
            .update({ current_price: newPrice })
            .eq('id', h.id)
            .then(() => {});
          
          return calculateHolding({ ...h, current_price: newPrice });
        }
        return h;
      });

      setHoldings(updatedHoldings);
    }
    setPricesLoading(false);
  }, [fetchPrices]);

  const fetchHoldings = async () => {
    if (!user) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const holdingsWithCalcs: HoldingWithCalculations[] = (data || []).map(calculateHolding);
      setHoldings(holdingsWithCalcs);

      // Fetch live prices after initial load
      if (holdingsWithCalcs.length > 0) {
        updateHoldingPrices(holdingsWithCalcs);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching holdings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (holding: {
    asset_name: string;
    asset_symbol: string;
    asset_type: 'stock' | 'mutual_fund' | 'etf' | 'debt';
    quantity: number;
    buy_price: number;
    current_price: number;
    sector?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase.from('holdings').insert({
        user_id: user.id,
        ...holding,
      });

      if (error) throw error;

      await fetchHoldings();
      toast({ title: 'Holding added successfully' });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error adding holding',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    try {
      const { error } = await supabase
        .from('holdings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchHoldings();
      toast({ title: 'Holding updated successfully' });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error updating holding',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchHoldings();
      toast({ title: 'Holding deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error deleting holding',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const refreshPrices = useCallback(() => {
    if (holdings.length > 0) {
      updateHoldingPrices(holdings);
    }
  }, [holdings, updateHoldingPrices]);

  useEffect(() => {
    fetchHoldings();
  }, [user]);

  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    if (holdings.length === 0) return;
    
    const interval = setInterval(() => {
      updateHoldingPrices(holdings);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [holdings.length, updateHoldingPrices]);

  // Calculate aggregates
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.buy_price), 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Calculate sector allocation
  const sectorMap = holdings.reduce((acc, h) => {
    const sector = h.sector || 'Others';
    acc[sector] = (acc[sector] || 0) + h.value;
    return acc;
  }, {} as Record<string, number>);

  const sectorAllocation = Object.entries(sectorMap).map(([name, value], index) => {
    const colors = [
      'hsl(239, 84%, 67%)',
      'hsl(142, 71%, 45%)',
      'hsl(38, 92%, 50%)',
      'hsl(280, 65%, 55%)',
      'hsl(218, 11%, 55%)',
    ];
    return {
      name,
      value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      color: colors[index % colors.length],
    };
  });

  return {
    holdings,
    loading,
    pricesLoading,
    totalValue,
    totalInvested,
    totalPnl,
    totalPnlPercent,
    sectorAllocation,
    addHolding,
    updateHolding,
    deleteHolding,
    refetch: fetchHoldings,
    refreshPrices,
  };
}
