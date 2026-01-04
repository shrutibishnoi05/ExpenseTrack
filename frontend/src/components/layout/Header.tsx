'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/providers';
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Menu, Moon, Sun, Bell, LogOut, User, Settings } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

export function Header() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            {/* Mobile Menu Button */}
            <button className="rounded-lg p-2 hover:bg-accent lg:hidden">
                <Menu className="h-5 w-5" />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title="Toggle theme"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative" title="Notifications">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                    >
                        <Avatar className="h-8 w-8">
                            {user?.profilePicture && (
                                <AvatarImage
                                    src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}${user.profilePicture}`}
                                    alt={user.name}
                                />
                            )}
                            <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-card py-1 shadow-lg">
                                <div className="border-b px-4 py-3">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>

                                <Link
                                    href="/profile"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>

                                <div className="border-t">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            logout();
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
