import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Lock, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user arrived via password reset link (has recovery session)
    if (!session) {
      // Wait a moment for session to be established from URL hash
      const timeout = setTimeout(() => {
        // If still no session after delay, user may have navigated directly
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 opacity-0 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">FinSightAI</h1>
              <p className="text-xs text-muted-foreground">Smart Investing</p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Password Updated</h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully updated. Redirecting you to the dashboard...
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                Set New Password
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Enter your new password below
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-secondary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-secondary/50"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
