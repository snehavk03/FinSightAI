import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  data: AllocationData[];
  totalValue: number;
  loading: boolean;
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

export function AllocationChart({ data, totalValue, loading }: AllocationChartProps) {
  const hasData = data.length > 0 && totalValue > 0;

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Asset Allocation</h3>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : !hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <PieChartIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No allocation data</p>
          <p className="text-xs text-muted-foreground mt-1">Add holdings to see your allocation</p>
        </div>
      ) : (
        <>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(216, 18%, 11%)',
                    border: '1px solid hsl(217, 19%, 17%)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  labelStyle={{ color: 'hsl(210, 29%, 93%)' }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-mono font-semibold text-foreground">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="font-mono text-sm text-foreground ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
