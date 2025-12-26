import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Mail, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const validation = emailSchema.safeParse({ email });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setResetSent(true);
        }
      } else {
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        if (mode === 'login') {
          const { error } = await signIn(email, password);
          if (error) {
            if (error.message.includes('Invalid login')) {
              setError('Invalid email or password');
            } else {
              setError(error.message);
            }
          }
        } else {
          const { error } = await signUp(email, password);
          if (error) {
            if (error.message.includes('already registered')) {
              setError('This email is already registered. Please sign in.');
            } else {
              setError(error.message);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const getTitle = () => {
    if (mode === 'forgot') return 'Reset Password';
    if (mode === 'signup') return 'Create Account';
    return 'Welcome Back';
  };

  const getSubtitle = () => {
    if (mode === 'forgot') return 'Enter your email to receive a reset link';
    if (mode === 'signup') return 'Start your investment journey';
    return 'Sign in to manage your portfolio';
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

          {/* Back button for forgot password */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            {getTitle()}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {getSubtitle()}
          </p>

          {/* Reset email sent success */}
          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                <p className="text-muted-foreground text-sm">
                  We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => switchMode('login')}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/50"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
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
                )}

                {/* Forgot password link */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {mode === 'forgot' ? 'Sending...' : mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {mode !== 'forgot' && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <span className="font-medium text-primary">
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
