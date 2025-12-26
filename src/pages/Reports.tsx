import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const monthlyData = [
  { month: 'Jan', invested: 50000, returns: 4200, value: 1854200 },
  { month: 'Feb', invested: 50000, returns: 8500, value: 1912700 },
  { month: 'Mar', invested: 50000, returns: -3200, value: 1959500 },
  { month: 'Apr', invested: 50000, returns: 12400, value: 2021900 },
  { month: 'May', invested: 50000, returns: 15600, value: 2087500 },
  { month: 'Jun', invested: 50000, returns: 18200, value: 2155700 },
  { month: 'Jul', invested: 50000, returns: 9800, value: 2215500 },
  { month: 'Aug', invested: 50000, returns: 22100, value: 2287600 },
];

const sectorPerformance = [
  { name: 'IT', returns: 12.5 },
  { name: 'Banking', returns: 8.2 },
  { name: 'Energy', returns: 15.3 },
  { name: 'FMCG', returns: 5.1 },
  { name: 'Pharma', returns: -2.4 },
];

const reports = [
  { id: 1, title: 'Monthly Portfolio Summary', type: 'Monthly', date: 'Aug 2024', status: 'Ready' },
  { id: 2, title: 'Quarterly Tax Report', type: 'Quarterly', date: 'Q2 FY25', status: 'Ready' },
  { id: 3, title: 'Annual Investment Analysis', type: 'Annual', date: 'FY24', status: 'Ready' },
  { id: 4, title: 'Risk Assessment Report', type: 'On-demand', date: 'Aug 15, 2024', status: 'Ready' },
];

type TabType = 'overview' | 'performance' | 'downloads';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const totalInvested = monthlyData.reduce((sum, d) => sum + d.invested, 0);
  const totalReturns = monthlyData.reduce((sum, d) => sum + d.returns, 0);
  const currentValue = monthlyData[monthlyData.length - 1].value;
  const overallReturn = ((currentValue - (currentValue - totalReturns)) / (currentValue - totalReturns)) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Track your investment performance and insights</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          This Year
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1 w-fit opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {([
          { key: 'overview', label: 'Overview', icon: PieChart },
          { key: 'performance', label: 'Performance', icon: BarChart3 },
          { key: 'downloads', label: 'Downloads', icon: FileText },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Current Value</p>
              <p className="font-mono text-2xl font-bold text-foreground">
                ₹{(currentValue / 100000).toFixed(2)}L
              </p>
            </div>
            <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
              <p className="font-mono text-2xl font-bold text-foreground">
                ₹{(totalInvested / 100000).toFixed(2)}L
              </p>
            </div>
            <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Total Returns</p>
              <p className={cn(
                "font-mono text-2xl font-bold",
                totalReturns >= 0 ? "text-success" : "text-destructive"
              )}>
                {totalReturns >= 0 ? '+' : ''}₹{(totalReturns / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Overall Return</p>
              <p className={cn(
                "font-mono text-2xl font-bold",
                overallReturn >= 0 ? "text-success" : "text-destructive"
              )}>
                {overallReturn >= 0 ? '+' : ''}{overallReturn.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Portfolio Value Chart */}
          <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-6">Portfolio Value Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 19%, 17%)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(216, 18%, 11%)',
                      border: '1px solid hsl(217, 19%, 17%)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(239, 84%, 67%)"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Monthly Returns */}
          <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Returns</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 19%, 17%)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(218, 11%, 55%)', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(216, 18%, 11%)',
                      border: '1px solid hsl(217, 19%, 17%)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Returns']}
                  />
                  <Bar 
                    dataKey="returns" 
                    radius={[4, 4, 0, 0]}
                    fill="hsl(239, 84%, 67%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Performance */}
          <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-6">Sector Performance (YTD)</h3>
            <div className="space-y-4">
              {sectorPerformance.map((sector) => (
                <div key={sector.name} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-muted-foreground">{sector.name}</span>
                  <div className="flex-1 h-8 bg-secondary/50 rounded-lg overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-lg transition-all duration-500",
                        sector.returns >= 0 ? "bg-success" : "bg-destructive"
                      )}
                      style={{ 
                        width: `${Math.min(Math.abs(sector.returns) * 5, 100)}%`,
                        marginLeft: sector.returns < 0 ? 'auto' : 0,
                      }}
                    />
                  </div>
                  <span className={cn(
                    "w-16 text-right font-mono text-sm font-medium",
                    sector.returns >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {sector.returns >= 0 ? '+' : ''}{sector.returns}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div 
              key={report.id}
              className="glass-card p-6 flex items-center justify-between opacity-0 animate-fade-in"
              style={{ animationDelay: `${150 + index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{report.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{report.type}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{report.date}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          ))}

          {/* AI Summary */}
          <div className="glass-card p-6 mt-8 border-l-4 border-l-primary opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Monthly Summary - August 2024</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground font-medium">Portfolio Health: </span>
                Your portfolio gained 3.2% this month, outperforming NIFTY 50 by 1.1%. The IT sector continues to drive returns.
              </p>
              <p>
                <span className="text-foreground font-medium">Key Highlight: </span>
                Your SIP investments are on track. Consistency in monthly investments is building long-term wealth.
              </p>
              <p>
                <span className="text-foreground font-medium">Action Item: </span>
                Consider booking partial profits in Reliance (up 15% from cost) and reallocating to underweighted banking sector.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
