import { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, Shield, RefreshCw, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { HoldingWithCalculations } from '@/hooks/useHoldings';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'suggestion' | 'alert' | 'opportunity' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIInsightsProps {
  holdings?: HoldingWithCalculations[];
  sectorAllocation?: { name: string; value: number }[];
  totalValue?: number;
  totalPnlPercent?: number;
}

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
  low: 'border-l-success bg-success/5',
};

const iconStyles = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-success/20 text-success',
};

const typeIcons = {
  suggestion: Sparkles,
  alert: AlertTriangle,
  opportunity: TrendingUp,
  info: Info,
};

export function AIInsights({ holdings = [], sectorAllocation = [], totalValue = 0, totalPnlPercent = 0 }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    if (holdings.length === 0) {
      setInsights([{
        type: 'info',
        title: 'No Holdings Yet',
        description: 'Add your investments to get AI-powered portfolio insights and personalized recommendations.',
        priority: 'low'
      }]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-insights', {
        body: {
          holdings: holdings.map(h => ({
            asset_name: h.asset_name,
            asset_symbol: h.asset_symbol,
            asset_type: h.asset_type,
            quantity: h.quantity,
            buy_price: h.buy_price,
            current_price: h.current_price,
            sector: h.sector,
            value: h.value,
            pnlPercent: h.pnlPercent,
          })),
          sectorAllocation,
          totalValue,
          totalPnlPercent,
        },
      });

      if (error) {
        console.error('Error fetching insights:', error);
        throw error;
      }

      if (data?.insights) {
        setInsights(data.insights);
        setLastFetched(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setInsights([{
        type: 'info',
        title: 'Insights Unavailable',
        description: 'Unable to generate insights at this time. Click refresh to try again.',
        priority: 'low'
      }]);
    } finally {
      setLoading(false);
    }
  }, [holdings, sectorAllocation, totalValue, totalPnlPercent]);

  // Fetch insights when holdings change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (holdings.length > 0 && !lastFetched) {
        fetchInsights();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [holdings.length, lastFetched, fetchInsights]);

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className={cn(
            "p-2 rounded-lg hover:bg-secondary/50 transition-colors",
            loading && "animate-spin"
          )}
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {loading && insights.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border-l-4 border-l-muted bg-muted/10 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = typeIcons[insight.type] || Info;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${priorityStyles[insight.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconStyles[insight.priority]}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastFetched && (
        <p className="text-xs text-muted-foreground mt-4 text-right">
          Updated {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
