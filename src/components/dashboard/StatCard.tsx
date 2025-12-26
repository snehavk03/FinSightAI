import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, change, icon: Icon, delay = 0 }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div 
      className="glass-card p-6 glow-effect opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
            isPositive && "bg-success/20 text-success",
            isNegative && "bg-destructive/20 text-destructive",
            !isPositive && !isNegative && "bg-muted text-muted-foreground"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="stat-label mb-1">{title}</p>
      <p className="stat-value text-foreground">{value}</p>
    </div>
  );
}
