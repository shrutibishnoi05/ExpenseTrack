'use client';

import Link from 'next/link';
import { useAuth } from '@/providers';
import { Button } from '@/components/ui';
import {
    Wallet,
    BarChart3,
    Shield,
    Smartphone,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    PieChart,
    Bell,
} from 'lucide-react';

const features = [
    {
        icon: Wallet,
        title: 'Track Every Expense',
        description: 'Log expenses instantly with categories, payment methods, and receipt uploads.',
    },
    {
        icon: PieChart,
        title: 'Visual Analytics',
        description: 'Understand spending patterns with beautiful charts and detailed breakdowns.',
    },
    {
        icon: TrendingUp,
        title: 'Budget Management',
        description: 'Set monthly budgets and get alerts before you overspend.',
    },
    {
        icon: Bell,
        title: 'Smart Alerts',
        description: 'Receive notifications when approaching or exceeding your budget limits.',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your financial data is encrypted and protected with industry-standard security.',
    },
    {
        icon: Smartphone,
        title: 'Mobile Friendly',
        description: 'Access your finances anywhere with our responsive mobile design.',
    },
];

const benefits = [
    'Track expenses in multiple currencies',
    'Categorize spending automatically',
    'Export reports as CSV or PDF',
    'Set recurring expense reminders',
    'Compare income vs expenses',
    'Dark mode for comfortable viewing',
];

export default function LandingPage() {
    const { isAuthenticated, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Wallet className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">ExpenseTrack</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {!isLoading && (
                            <>
                                {isAuthenticated ? (
                                    <Button asChild>
                                        <Link href="/dashboard">Go to Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" asChild>
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/signup">Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
                        <span className="mr-2 flex h-2 w-2 rounded-full bg-green-500" />
                        Now with AI-powered insights
                    </div>

                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                        Take Control of Your{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Finances
                        </span>
                    </h1>

                    <p className="mb-10 text-xl text-muted-foreground">
                        Track expenses, manage budgets, and achieve your financial goals with our powerful yet
                        simple expense tracking platform.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="xl" asChild className="group">
                            <Link href="/signup">
                                Start Free Today
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        No credit card required • Free forever for personal use
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y bg-muted/30 py-12">
                <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
                    {[
                        { value: '10,000+', label: 'Active Users' },
                        { value: '₹50Cr+', label: 'Expenses Tracked' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '4.9/5', label: 'User Rating' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-bold text-primary">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 py-20">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
                    <p className="text-muted-foreground">
                        Powerful features to help you manage your money better
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="border-y bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold">
                                Why Choose ExpenseTrack?
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Join thousands of users who have transformed their financial habits with our
                                intuitive expense tracking solution.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center">
                                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-video rounded-xl border bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-8">
                                <div className="flex h-full items-center justify-center">
                                    <BarChart3 className="h-32 w-32 text-primary/50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="mb-4 text-3xl font-bold">Ready to Start Saving?</h2>
                    <p className="mb-8 text-muted-foreground">
                        Join ExpenseTrack today and take the first step towards financial freedom.
                    </p>
                    <Button size="xl" asChild>
                        <Link href="/signup">Create Free Account</Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Wallet className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold">ExpenseTrack</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 ExpenseTrack. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
