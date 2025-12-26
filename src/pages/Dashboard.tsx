import { Wallet, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { PortfolioGrowthChart } from '@/components/dashboard/PortfolioGrowthChart';
import { HoldingsList } from '@/components/dashboard/HoldingsList';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { useHoldings } from '@/hooks/useHoldings';

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

export default function Dashboard() {
  const { holdings, loading, totalValue, totalInvested, totalPnl, totalPnlPercent, sectorAllocation } = useHoldings();

  const todaysPnl = totalPnl; // Using total P&L as we don't have daily tracking yet
  const todaysPnlPercent = totalPnlPercent;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Value"
          value={loading ? '...' : formatCurrency(totalValue)}
          change={totalPnlPercent}
          icon={Wallet}
          delay={100}
        />
        <StatCard
          title="Total P&L"
          value={loading ? '...' : `${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}`}
          change={todaysPnlPercent}
          icon={TrendingUp}
          delay={150}
        />
        <StatCard
          title="Total Invested"
          value={loading ? '...' : formatCurrency(totalInvested)}
          icon={PiggyBank}
          delay={200}
        />
        <StatCard
          title="Holdings"
          value={loading ? '...' : `${holdings.length}`}
          icon={Target}
          delay={250}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioGrowthChart holdings={holdings} loading={loading} />
        </div>
        <AllocationChart data={sectorAllocation} totalValue={totalValue} loading={loading} />
      </div>

      {/* Holdings and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HoldingsList holdings={holdings} loading={loading} />
        <AIInsights 
          holdings={holdings} 
          sectorAllocation={sectorAllocation} 
          totalValue={totalValue} 
          totalPnlPercent={totalPnlPercent} 
        />
      </div>
    </div>
  );
}
