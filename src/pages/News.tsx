import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Filter, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useHoldings } from '@/hooks/useHoldings';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

type Sentiment = 'bullish' | 'bearish' | 'neutral';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: Sentiment;
  stocks: string[];
  impact: string;
  aiInsight: string;
  action: 'Hold' | 'Watch' | 'Reduce';
}

const sentimentConfig = {
  bullish: { icon: TrendingUp, label: 'Bullish', class: 'sentiment-bullish' },
  bearish: { icon: TrendingDown, label: 'Bearish', class: 'sentiment-bearish' },
  neutral: { icon: Minus, label: 'Neutral', class: 'sentiment-neutral' },
};

const actionConfig = {
  Hold: 'bg-success/20 text-success border-success/30',
  Watch: 'bg-warning/20 text-warning border-warning/30',
  Reduce: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function News() {
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | 'all'>('all');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { holdings, loading: holdingsLoading } = useHoldings();

  useEffect(() => {
    const fetchNews = async () => {
      if (holdingsLoading) return;
      
      if (!holdings || holdings.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('portfolio-news', {
          body: { 
            holdings: holdings.map(h => ({
              asset_symbol: h.asset_symbol,
              asset_name: h.asset_name,
              quantity: h.quantity,
              buy_price: h.buy_price,
              current_price: h.current_price,
              sector: h.sector
            }))
          }
        });

        if (fnError) throw fnError;
        
        if (data?.news) {
          setNewsItems(data.news);
        } else if (data?.message) {
          setError(data.message);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to fetch portfolio news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [holdings, holdingsLoading]);

  const filteredNews = newsItems.filter(
    (item) => selectedSentiment === 'all' || item.sentiment === selectedSentiment
  );

  // Empty state when no holdings
  if (!holdingsLoading && (!holdings || holdings.length === 0)) {
    return (
      <div className="space-y-8">
        <div className="opacity-0 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Portfolio News</h1>
          <p className="text-muted-foreground mt-1">AI-curated news for your investments</p>
        </div>
        
        <div className="glass-card p-8 text-center opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Holdings Found</h3>
          <p className="text-muted-foreground mb-4">
            Add stocks to your portfolio to see personalized news and AI analysis.
          </p>
          <Link 
            to="/portfolio" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio News</h1>
          <p className="text-muted-foreground mt-1">AI-curated news for your investments</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
          {(['all', 'bullish', 'bearish', 'neutral'] as const).map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => setSelectedSentiment(sentiment)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                selectedSentiment === sentiment
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {sentiment === 'all' ? (
                <>
                  <Filter className="w-3 h-3" />
                  All
                </>
              ) : (
                <>
                  {sentiment === 'bullish' && <TrendingUp className="w-3 h-3" />}
                  {sentiment === 'bearish' && <TrendingDown className="w-3 h-3" />}
                  {sentiment === 'neutral' && <Minus className="w-3 h-3" />}
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-8 text-center opacity-0 animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Fetching and analyzing news for your portfolio...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glass-card p-8 text-center opacity-0 animate-fade-in">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Empty News State */}
      {!loading && !error && newsItems.length === 0 && holdings && holdings.length > 0 && (
        <div className="glass-card p-8 text-center opacity-0 animate-fade-in">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent news found for your holdings.</p>
        </div>
      )}

      {/* News Feed */}
      {!loading && filteredNews.length > 0 && (
        <div className="space-y-6">
          {filteredNews.map((news, index) => {
            const SentimentIcon = sentimentConfig[news.sentiment]?.icon || Minus;
            const sentimentClass = sentimentConfig[news.sentiment]?.class || 'sentiment-neutral';
            const sentimentLabel = sentimentConfig[news.sentiment]?.label || 'Neutral';
            const actionClass = actionConfig[news.action] || actionConfig.Watch;

            return (
              <div
                key={news.id}
                className="glass-card p-6 opacity-0 animate-fade-in hover:shadow-elevated transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={cn("rounded-md px-2 py-0.5", sentimentClass)}>
                        <SentimentIcon className="w-3 h-3 mr-1" />
                        {sentimentLabel}
                      </Badge>
                      <Badge className={cn("rounded-md px-2 py-0.5 border", actionClass)}>
                        {news.action}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {news.time}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                      {news.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {news.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Affects:</span>
                      {news.stocks.map((stock) => (
                        <Badge key={stock} variant="secondary" className="font-mono text-xs">
                          {stock}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* AI Insight */}
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs">AI</span>
                    </div>
                    <span className="text-sm font-medium text-primary">AI Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Impact: </span>
                    {news.impact}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    <span className="text-foreground font-medium">For You: </span>
                    {news.aiInsight}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Source: {news.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
