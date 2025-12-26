import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  Newspaper, 
  Lightbulb, 
  FileText,
  TrendingUp,
  IndianRupee,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/advisor', label: 'Advisor', icon: Lightbulb },
  { path: '/reports', label: 'Reports', icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/60 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">FinSightAI</h1>
            <p className="text-xs text-muted-foreground">Smart Investing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive && "active"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Market Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Market Open</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">NIFTY 50</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm text-foreground">24,834</span>
                <TrendingUp className="w-3 h-3 text-success" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">SENSEX</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm text-foreground">81,523</span>
                <TrendingUp className="w-3 h-3 text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">
            {user?.email}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}