import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoldingWithCalculations } from '@/hooks/useHoldings';
import { Link } from 'react-router-dom';

interface HoldingsListProps {
  holdings: HoldingWithCalculations[];
  loading: boolean;
}

export function HoldingsList({ holdings, loading }: HoldingsListProps) {
  const topHoldings = holdings.slice(0, 5);

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Holdings</h3>
        <Link to="/portfolio" className="text-sm text-primary hover:text-primary/80 transition-colors">
          View All
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div>
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded mt-1" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : topHoldings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No holdings yet</p>
          <Link to="/portfolio" className="text-sm text-primary hover:text-primary/80 mt-2">
            Add your first investment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {topHoldings.map((holding) => (
            <div 
              key={holding.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-mono text-xs text-primary font-medium">
                    {holding.asset_symbol.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{holding.asset_symbol}</p>
                  <p className="text-xs text-muted-foreground">{holding.asset_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium text-foreground">
                  ₹{holding.value >= 1000 ? `${(holding.value / 1000).toFixed(1)}K` : holding.value.toFixed(0)}
                </p>
                <div className={cn(
                  "flex items-center gap-1 justify-end text-xs",
                  holding.pnlPercent >= 0 ? "text-success" : "text-destructive"
                )}>
                  {holding.pnlPercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(holding.pnlPercent).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
