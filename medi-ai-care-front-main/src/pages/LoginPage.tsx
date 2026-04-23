import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { loginUser, verifyOtp } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ROLES = ['patient', 'doctor', 'admin'] as const;

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('patient');
  const [showPw, setShowPw]     = useState(false);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate    = useNavigate();

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    }
  }, [step]);

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser({ email, password });
      toast.success('OTP sent! Check your email inbox.');
      setStep('otp');
      startCountdown();
    } catch (err: any) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (autoOtp?: string) => {
    const otp = autoOtp ?? otpDigits.join('');
    if (otp.length < 6) {
      toast.error('Please enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      const { token, id, doctorId, fullName, role: userRole } = res.data;

      // FIX: Store doctorId (doctors.id) separately from id (users.id).
      //      Appointments are stored with doctorId from the doctors table.
      //      Doctor dashboards must query using doctorId, NOT id —
      //      otherwise getDoctorAppointments() always returns 0 results.
      const userData = {
        id:       String(id),
        doctorId: doctorId ? String(doctorId) : undefined,
        fullName: fullName,
        email,
        role:     userRole.toLowerCase(),  // "doctor" | "patient"
      };

      setAuth(userData as any, token);
      localStorage.setItem('mediai_token', token);
      localStorage.setItem('mediai_user', JSON.stringify(userData));

      toast.success(`Welcome back, ${fullName}!`);

      // Navigate based on role
      if (userData.role === 'doctor')     navigate('/doctor/dashboard');
      else if (userData.role === 'admin') navigate('/admin-dashboard');
      else                                navigate('/patient-dashboard');

    } catch (err: any) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Invalid or expired OTP.');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      await loginUser({ email, password });
      toast.success('New OTP sent!');
      setOtpDigits(['', '', '', '', '', '']);
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch {
      toast.error('Could not resend OTP. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val;
    setOtpDigits(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (val && i === 5) {
      const full = next.join('');
      if (full.length === 6) handleOtpVerify(full);
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md">

          {/* ── STEP 1: Credentials ──────────────────────────────────── */}
          {step === 'credentials' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Access your Medi-AI Care portal</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <Tabs value={role} onValueChange={setRole}>
                  <TabsList className="mb-6 w-full">
                    {ROLES.map(r => (
                      <TabsTrigger key={r} value={r} className="flex-1 capitalize">{r}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPw(!showPw)}
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
                      : 'Next Step →'}
                  </Button>
                </form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary hover:underline">Sign Up</Link>
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: OTP ─────────────────────────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
                <p className="mt-1 text-sm text-muted-foreground">We sent a 6-digit code to</p>
                <p className="mt-1 text-sm font-semibold text-primary">{email}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <Label className="block text-center text-sm text-muted-foreground mb-5">
                  Enter the 6-digit OTP below
                </Label>

                <div className="flex justify-center gap-2 mb-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onFocus={e => e.target.select()}
                      className="w-11 h-13 text-center text-xl font-bold border-2 border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      style={{ height: '52px', fontSize: '20px' }}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 mb-5 text-xs text-muted-foreground">
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive it?"}</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className={`font-semibold text-xs transition-colors ${
                      countdown > 0 || loading
                        ? 'text-muted-foreground cursor-not-allowed'
                        : 'text-primary hover:underline cursor-pointer'
                    }`}
                  >
                    Resend OTP
                  </button>
                </div>

                <Button
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  onClick={() => handleOtpVerify()}
                  disabled={loading || otpDigits.join('').length < 6}
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    : 'Verify & Sign In'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtpDigits(['', '', '', '', '', '']); }}
                  className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
