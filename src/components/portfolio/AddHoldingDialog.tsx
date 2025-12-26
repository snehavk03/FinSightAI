import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';

const SECTORS = ['IT Services', 'Banking', 'Energy', 'FMCG', 'Pharma', 'Auto', 'Debt', 'Others'];

export function AddHoldingDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addHolding } = useHoldings();
  
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_symbol: '',
    asset_type: 'stock' as 'stock' | 'mutual_fund' | 'etf' | 'debt',
    quantity: '',
    buy_price: '',
    current_price: '',
    sector: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await addHolding({
      asset_name: formData.asset_name,
      asset_symbol: formData.asset_symbol.toUpperCase(),
      asset_type: formData.asset_type,
      quantity: Number(formData.quantity),
      buy_price: Number(formData.buy_price),
      current_price: Number(formData.current_price),
      sector: formData.sector || undefined,
    });

    setLoading(false);

    if (!error) {
      setOpen(false);
      setFormData({
        asset_name: '',
        asset_symbol: '',
        asset_type: 'stock',
        quantity: '',
        buy_price: '',
        current_price: '',
        sector: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_symbol">Symbol</Label>
              <Input
                id="asset_symbol"
                placeholder="RELIANCE"
                value={formData.asset_symbol}
                onChange={(e) => setFormData({ ...formData, asset_symbol: e.target.value })}
                className="bg-secondary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_type">Type</Label>
              <Select
                value={formData.asset_type}
                onValueChange={(value: 'stock' | 'mutual_fund' | 'etf' | 'debt') => 
                  setFormData({ ...formData, asset_type: value })
                }
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_name">Name</Label>
            <Input
              id="asset_name"
              placeholder="Reliance Industries Ltd"
              value={formData.asset_name}
              onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-secondary/50 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy_price">Buy Price (₹)</Label>
              <Input
                id="buy_price"
                type="number"
                step="0.01"
                placeholder="2400"
                value={formData.buy_price}
                onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                className="bg-secondary/50 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price (₹)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                placeholder="2545"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                className="bg-secondary/50 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select
              value={formData.sector}
              onValueChange={(value) => setFormData({ ...formData, sector: value })}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Investment'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
