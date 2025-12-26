import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useHoldings } from '@/hooks/useHoldings';
import { AddHoldingDialog } from '@/components/portfolio/AddHoldingDialog';

type FilterType = 'all' | 'stocks' | 'mutual-funds' | 'debt';

const assetTypeMap: Record<string, string> = {
  stock: 'Stock',
  mutual_fund: 'Mutual Fund',
  etf: 'ETF',
  debt: 'Debt',
};

const filterTypeMap: Record<FilterType, string[]> = {
  all: ['stock', 'mutual_fund', 'etf', 'debt'],
  stocks: ['stock'],
  'mutual-funds': ['mutual_fund'],
  debt: ['debt'],
};

export default function Portfolio() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    holdings,
    loading,
    totalValue,
    totalPnl,
    totalPnlPercent,
    sectorAllocation,
  } = useHoldings();

  const filteredHoldings = holdings.filter((h) => {
    const matchesFilter = filterTypeMap[filter].includes(h.asset_type);
    const matchesSearch = 
      h.asset_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.asset_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const displaySectorAllocation = sectorAllocation.length > 0 
    ? sectorAllocation 
    : [{ name: 'No Data', value: 100, color: 'hsl(218, 11%, 25%)' }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track and manage your investments</p>
        </div>
        <AddHoldingDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground mb-2">Total Investment Value</p>
          <p className="font-mono text-3xl font-bold text-foreground">
            ₹{totalValue > 0 ? (totalValue / 100000).toFixed(2) : '0.00'}L
          </p>
        </div>
        <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-muted-foreground mb-2">Total P&L</p>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "font-mono text-3xl font-bold",
              totalPnl >= 0 ? "text-success" : "text-destructive"
            )}>
              {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl) > 1000 ? (totalPnl / 1000).toFixed(1) + 'K' : totalPnl.toFixed(0)}
            </p>
            <span className={cn(
              "text-sm font-medium",
              totalPnl >= 0 ? "text-success" : "text-destructive"
            )}>
              ({totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground mb-2">Holdings Count</p>
          <p className="font-mono text-3xl font-bold text-foreground">{holdings.length}</p>
        </div>
      </div>

      {/* Sector Allocation and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sector Allocation */}
        <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Sector Allocation</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displaySectorAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {displaySectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(216, 18%, 11%)',
                    border: '1px solid hsl(217, 19%, 17%)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {displaySectorAllocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-3 glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Holdings</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
                {(['all', 'stocks', 'mutual-funds', 'debt'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      filter === f 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f === 'all' ? 'All' : f === 'stocks' ? 'Stocks' : f === 'mutual-funds' ? 'MFs' : 'Debt'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredHoldings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {holdings.length === 0 
                  ? 'No holdings yet. Add your first investment!'
                  : 'No holdings match your search.'}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg. Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">LTP</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHoldings.map((holding) => (
                    <tr 
                      key={holding.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{holding.asset_symbol}</p>
                          <p className="text-xs text-muted-foreground">{holding.asset_name}</p>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-mono text-foreground">{holding.quantity}</td>
                      <td className="text-right py-4 px-4 font-mono text-muted-foreground">₹{holding.buy_price.toLocaleString()}</td>
                      <td className="text-right py-4 px-4 font-mono text-foreground">₹{holding.current_price.toLocaleString()}</td>
                      <td className="text-right py-4 px-4 font-mono text-foreground">₹{holding.value.toLocaleString()}</td>
                      <td className="text-right py-4 px-4">
                        <div className={cn(
                          "flex items-center justify-end gap-1",
                          holding.pnl >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {holding.pnl >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-mono">
                            {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()}
                          </span>
                          <span className="text-xs">({holding.pnlPercent.toFixed(2)}%)</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
