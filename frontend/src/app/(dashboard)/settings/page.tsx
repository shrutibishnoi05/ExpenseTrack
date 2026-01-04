'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useAuth } from '@/providers';
import { Sun, Moon, Monitor, Palette, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Customize your application preferences</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize how the app looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${theme === 'light' ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span className="text-sm">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span className="text-sm">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${theme === 'system' ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span className="text-sm">System</span>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Budget Alerts</p>
                                <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
                            </div>
                            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Weekly Summary</p>
                                <p className="text-sm text-muted-foreground">Receive weekly expense summaries</p>
                            </div>
                            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Recurring Reminders</p>
                                <p className="text-sm text-muted-foreground">Reminders for recurring expenses</p>
                            </div>
                            <input type="checkbox" className="h-4 w-4 rounded" />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Account Type</Label>
                                <p className="font-medium capitalize">{user?.role}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Currency</Label>
                                <p className="font-medium">{user?.currency}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Member Since</Label>
                                <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
