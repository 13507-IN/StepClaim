'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore, calculateStepLength } from '@/store/useUserStore';
import { authService, getApiErrorMessage } from '@/services/auth.api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Footprints, Ruler, Weight, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'profile'>('register');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useUserStore((state) => state.setAuth);
  const updateBodyProfile = useUserStore((state) => state.updateBodyProfile);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken);
        // Prompt for height and weight immediately after account creation
        setStep('profile');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'An error occurred during registration'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProfile = () => {
    const validHeight = Math.max(120, Math.min(240, Number(height) || 175));
    const validWeight = Math.max(30, Math.min(250, Number(weight) || 70));
    updateBodyProfile(validHeight, validWeight);
    router.push('/dashboard');
  };

  const strideMeters = calculateStepLength(height, 'WALKING');
  const strideCm = Math.round(strideMeters * 100);
  const stepsPerKm = Math.round(1000 / strideMeters);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)]/20 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md glass-panel relative z-10">
        {step === 'register' ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
              <CardDescription>
                Join StepClaim and start conquering territories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-white bg-[var(--color-destructive)]/80 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Username"
                    {...register('username')}
                  />
                  {errors.username && <p className="text-xs text-[var(--color-destructive)]">{errors.username.message}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    type="email"
                    placeholder="Email address"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-xs text-[var(--color-destructive)]">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                  />
                  {errors.password && <p className="text-xs text-[var(--color-destructive)]">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-[var(--color-foreground)]/60">
                Already have an account? <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">Sign In</Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
                <Footprints className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-white">
                Personalize Your Stride
              </CardTitle>
              <CardDescription>
                StepClaim calculates your exact footstep count and active calories from your height and weight.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Height */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-sky-400" /> Height
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{height} cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="130"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="flex-1 accent-[var(--color-primary)] cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={height}
                    min="120"
                    max="240"
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-20 h-8 text-center text-xs font-mono bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5 text-amber-400" /> Weight
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{weight} kg</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="150"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={weight}
                    min="30"
                    max="250"
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-20 h-8 text-center text-xs font-mono bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Biomechanical Live Output */}
              <div className="grid grid-cols-2 gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl p-3 text-center">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400">Step Stride</p>
                  <p className="text-base font-black text-white mt-0.5">{strideCm} cm</p>
                  <p className="text-[10px] text-gray-400">({strideMeters.toFixed(2)}m / step)</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400">1 km Walking</p>
                  <p className="text-base font-black text-[var(--color-primary)] mt-0.5">~{stepsPerKm.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">steps</p>
                </div>
              </div>

              <Button
                onClick={handleFinishProfile}
                className="w-full h-11 rounded-xl bg-[var(--color-primary)] text-black font-black hover:bg-[var(--color-primary)]/90 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start Tracking Steps
              </Button>

              <button
                onClick={() => {
                  updateBodyProfile(175, 70);
                  router.push('/dashboard');
                }}
                className="w-full text-xs text-gray-400 hover:text-gray-200 text-center py-1 transition-colors"
              >
                Skip for now (default 175 cm / 70 kg)
              </button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
