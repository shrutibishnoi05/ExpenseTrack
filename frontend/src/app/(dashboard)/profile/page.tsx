'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar, AvatarImage, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { User, Mail, Wallet, Camera } from 'lucide-react';
import { getInitials, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    currency: z.string(),
    monthlyBudget: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const currencies = [
    { value: 'INR', label: '₹ Indian Rupee (INR)' },
    { value: 'USD', label: '$ US Dollar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ British Pound (GBP)' },
];

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            currency: user?.currency || 'INR',
            monthlyBudget: user?.monthlyBudget?.toString() || '0',
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            await api.put('/users/profile', {
                name: data.name,
                currency: data.currency,
                monthlyBudget: parseFloat(data.monthlyBudget),
            });

            updateUser({
                name: data.name,
                currency: data.currency,
                monthlyBudget: parseFloat(data.monthlyBudget),
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    {user?.profilePicture && (
                                        <AvatarImage src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}${user.profilePicture}`} alt={user.name} />
                                    )}
                                    <AvatarFallback className="text-2xl">{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                                </Avatar>
                                <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                Budget: {formatCurrency(user?.monthlyBudget || 0, user?.currency)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {message.text && (
                                <div className={`rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-destructive/10 text-destructive'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" className="pl-10" {...register('name')} error={errors.name?.message} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" className="pl-10" value={user?.email} disabled />
                                </div>
                                <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Preferred Currency</Label>
                                <Select defaultValue={user?.currency} onValueChange={(v) => setValue('currency', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input id="monthlyBudget" type="number" className="pl-10" {...register('monthlyBudget')} />
                                </div>
                            </div>

                            <Button type="submit" loading={saving}>Save Changes</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
