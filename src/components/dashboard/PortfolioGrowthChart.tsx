import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { HoldingWithCalculations } from '@/hooks/useHoldings';

interface PortfolioGrowthChartProps {
  holdings: HoldingWithCalculations[];
  loading: boolean;
}

const formatValue = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

export function PortfolioGrowthChart({ holdings, loading }: PortfolioGrowthChartProps) {
  const hasData = holdings.length > 0;
  
  // Generate simple data based on current holdings - shows invested vs current value
  const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.buy_price), 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  
  const data = hasData ? [
    { label: 'Invested', value: totalInvested },
    { label: 'Current', value: totalValue },
  ] : [];

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Overview</h3>
        {hasData && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Value</span>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : !hasData ? (
        <div className="h-72 flex flex-col items-center justify-center text-center">
          <LineChartIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No portfolio data</p>
          <p className="text-xs text-muted-foreground mt-1">Add holdings to see your portfolio overview</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(217, 19%, 17%)" 
                vertical={false}
              />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(216, 18%, 11%)',
                  border: '1px solid hsl(217, 19%, 17%)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                labelStyle={{ color: 'hsl(210, 29%, 93%)' }}
                formatter={(value: number) => [formatValue(value), '']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
