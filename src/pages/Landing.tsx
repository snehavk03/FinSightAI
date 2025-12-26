import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  IndianRupee, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Brain,
  ArrowRight,
  UserPlus,
  BarChart3,
  Target
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Track Investments',
    description: 'Monitor your stocks, mutual funds, and ETFs with real-time price updates from NSE.'
  },
  {
    icon: PieChart,
    title: 'Sector Analysis',
    description: 'Visualize your portfolio allocation across sectors and identify concentration risks.'
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations and portfolio analysis powered by Gemini AI.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and accessible only to you with secure authentication.'
  }
];

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account in seconds'
  },
  {
    step: 2,
    icon: BarChart3,
    title: 'Add Investments',
    description: 'Enter your stocks, mutual funds, and ETFs'
  },
  {
    step: 3,
    icon: Target,
    title: 'Track Performance',
    description: 'Monitor returns and get AI-driven insights'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">FinSightAI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Brain className="w-4 h-4" />
            AI-Powered Portfolio Management
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Smart Investing
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track your investments, analyze sector allocations, and get AI-powered insights 
            to make smarter financial decisions. Built for Indian investors.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your Portfolio
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and AI-driven insights to help you track, analyze, and optimize your investments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-6 opacity-0 animate-fade-in hover:shadow-elevated transition-all hover:-translate-y-1"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.step}
                className="text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div 
            className="glass-card p-8 sm:p-12 text-center opacity-0 animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Take Control of Your Investments?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">FinSightAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinSightAI. All rights reserved. Built by Sneha Kondawar.
          </p>
        </div>
      </footer>
    </div>
  );
}
