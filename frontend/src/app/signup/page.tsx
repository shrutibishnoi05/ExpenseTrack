'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { Wallet, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const { signup } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const password = watch('password', '');

    // Password strength indicators
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    const onSubmit = async (data: SignupFormData) => {
        try {
            setIsLoading(true);
            setError('');
            await signup({
                name: data.name,
                email: data.email,
                password: data.password,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                            <Wallet className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">ExpenseTrack</span>
                    </Link>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Start tracking your expenses today</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register('name')}
                                    error={errors.name?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email')}
                                    error={errors.email?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        {...register('password')}
                                        error={errors.password?.message}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Requirements */}
                                {password && (
                                    <div className="mt-2 space-y-1.5 text-xs">
                                        <div className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            At least 8 characters
                                        </div>
                                        <div className={`flex items-center ${hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            One uppercase letter
                                        </div>
                                        <div className={`flex items-center ${hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            One lowercase letter
                                        </div>
                                        <div className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            One number
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    {...register('confirmPassword')}
                                    error={errors.confirmPassword?.message}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                                Create Account
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
