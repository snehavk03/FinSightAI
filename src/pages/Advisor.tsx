import { useState } from 'react';
import { Sparkles, IndianRupee, PiggyBank, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  riskTolerance: number;
}

interface AIAdvice {
  budgetOptimization: string[];
  savingsRecommendations: string[];
  goalSuggestions: string[];
  riskAssessment: string;
}

const mockAIAdvice: AIAdvice = {
  budgetOptimization: [
    "Your expense-to-income ratio is 60%, which is slightly high for optimal wealth building. Aim to reduce it to 50%.",
    "Consider tracking discretionary spending (dining, entertainment) using apps like Walnut or Money Manager.",
    "Your emergency fund should be ₹3,60,000 (6 months expenses). Currently you have ₹2,50,000 - a gap of ₹1,10,000.",
  ],
  savingsRecommendations: [
    "With ₹40,000 monthly surplus, allocate: 60% (₹24,000) to equity SIPs, 30% (₹12,000) to debt funds, 10% (₹4,000) to emergency fund top-up.",
    "Consider PPF for tax-saving (₹1.5L limit under 80C) with guaranteed 7.1% returns.",
    "Open an NPS account for additional ₹50,000 tax benefit under 80CCD(1B).",
  ],
  goalSuggestions: [
    "Retirement Corpus: At current savings rate, you can accumulate ₹5.2 Cr by age 60 (assuming 12% CAGR).",
    "Child Education: Start a dedicated fund now. ₹15,000/month SIP can grow to ₹45L in 15 years.",
    "Home Down Payment: For a ₹1 Cr property, you need ₹20L down payment. Achievable in 3 years with ₹50,000/month savings.",
  ],
  riskAssessment: "Based on your moderate-aggressive risk profile, a 60:30:10 (Equity:Debt:Gold) allocation is recommended. Your current 70% equity exposure is slightly aggressive - consider rebalancing ₹50,000 from equity to debt funds.",
};

export default function Advisor() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    currentSavings: 250000,
    riskTolerance: 60,
  });
  const [showAdvice, setShowAdvice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const surplus = financialData.monthlyIncome - financialData.monthlyExpenses;
  const savingsRate = ((surplus / financialData.monthlyIncome) * 100).toFixed(1);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAdvice(true);
    }, 2000);
  };

  const riskLabels = ['Conservative', 'Moderate', 'Aggressive'];
  const getRiskLabel = (value: number) => {
    if (value < 33) return riskLabels[0];
    if (value < 66) return riskLabels[1];
    return riskLabels[2];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Financial Advisor</h1>
        <p className="text-muted-foreground mt-1">Get personalized AI-powered financial guidance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass-card p-6 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Your Financial Profile
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income (₹)</Label>
              <Input
                id="income"
                type="number"
                value={financialData.monthlyIncome}
                onChange={(e) => setFinancialData({ ...financialData, monthlyIncome: Number(e.target.value) })}
                className="font-mono bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Monthly Expenses (₹)</Label>
              <Input
                id="expenses"
                type="number"
                value={financialData.monthlyExpenses}
                onChange={(e) => setFinancialData({ ...financialData, monthlyExpenses: Number(e.target.value) })}
                className="font-mono bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="savings">Current Savings (₹)</Label>
              <Input
                id="savings"
                type="number"
                value={financialData.currentSavings}
                onChange={(e) => setFinancialData({ ...financialData, currentSavings: Number(e.target.value) })}
                className="font-mono bg-secondary/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Risk Tolerance</Label>
                <span className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded",
                  financialData.riskTolerance < 33 ? "bg-success/20 text-success" :
                  financialData.riskTolerance < 66 ? "bg-warning/20 text-warning" :
                  "bg-destructive/20 text-destructive"
                )}>
                  {getRiskLabel(financialData.riskTolerance)}
                </span>
              </div>
              <Slider
                value={[financialData.riskTolerance]}
                onValueChange={(value) => setFinancialData({ ...financialData, riskTolerance: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Safe</span>
                <span>Balanced</span>
                <span>Risky</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-1">Monthly Surplus</p>
                <p className={cn(
                  "font-mono text-xl font-semibold",
                  surplus >= 0 ? "text-success" : "text-destructive"
                )}>
                  ₹{surplus.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
                <p className={cn(
                  "font-mono text-xl font-semibold",
                  Number(savingsRate) >= 30 ? "text-success" : 
                  Number(savingsRate) >= 20 ? "text-warning" : "text-destructive"
                )}>
                  {savingsRate}%
                </p>
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              className="w-full gap-2"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          {!showAdvice ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Financial Advisor</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Enter your financial details and get personalized recommendations tailored for the Indian market.
              </p>
            </div>
          ) : (
            <>
              {/* Budget Optimization */}
              <div className="glass-card p-6 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-warning" />
                  </div>
                  <h3 className="font-semibold text-foreground">Budget Optimization</h3>
                </div>
                <ul className="space-y-3">
                  {mockAIAdvice.budgetOptimization.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Savings Recommendations */}
              <div className="glass-card p-6 opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">Savings Strategy</h3>
                </div>
                <ul className="space-y-3">
                  {mockAIAdvice.savingsRecommendations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Goal Suggestions */}
              <div className="glass-card p-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Goal Planning</h3>
                </div>
                <ul className="space-y-3">
                  {mockAIAdvice.goalSuggestions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Assessment */}
              <div className="glass-card p-6 opacity-0 animate-slide-up border-l-4 border-l-primary" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Risk Assessment</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mockAIAdvice.riskAssessment}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
