'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    Wallet,
    Tag,
    Settings,
    DollarSign,
    Target,
    Download,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/providers';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Income', href: '/income', icon: DollarSign },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Budgets', href: '/budgets', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
    { name: 'Export', href: '/export', icon: Download },
];

const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: Shield },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:flex lg:flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ExpenseTrack</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Main
                </p>
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div className="my-4 border-t" />
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Admin
                        </p>
                        {adminNavigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="border-t p-4">
                <Link
                    href="/settings"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === '/settings'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
