'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Progress, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Plus, Edit, Trash2, Target, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { Budget, Category } from '@/types';

const budgetSchema = z.object({
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    limit: z.string().min(1, 'Budget limit is required'),
});

type BudgetForm = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [currentBudget, setCurrentBudget] = useState<{ budget: Budget; spent: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const currentDate = new Date();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BudgetForm>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            month: (currentDate.getMonth() + 1).toString(),
            year: currentDate.getFullYear().toString(),
        },
    });

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const [budgetsRes, currentRes] = await Promise.all([
                api.get('/budgets'),
                api.get('/budgets/current'),
            ]);
            setBudgets(budgetsRes.data.data.budgets || []);
            if (currentRes.data.data.budget) {
                setCurrentBudget({
                    budget: currentRes.data.data.budget,
                    spent: currentRes.data.data.spent || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const openAddModal = () => {
        setEditingBudget(null);
        reset({
            month: (currentDate.getMonth() + 1).toString(),
            year: currentDate.getFullYear().toString(),
            limit: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (budget: Budget) => {
        setEditingBudget(budget);
        reset({
            month: budget.month.toString(),
            year: budget.year.toString(),
            limit: budget.limit.toString(),
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: BudgetForm) => {
        try {
            setSubmitting(true);
            const payload = {
                month: parseInt(data.month),
                year: parseInt(data.year),
                limit: parseFloat(data.limit),
            };

            if (editingBudget) {
                await api.put(`/budgets/${editingBudget._id}`, payload);
            } else {
                await api.post('/budgets', payload);
            }
            setIsModalOpen(false);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to save budget:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteBudget = async (id: string) => {
        if (!confirm('Are you sure you want to delete this budget?')) return;
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to delete budget:', error);
        }
    };

    const percentUsed = currentBudget
        ? Math.round((currentBudget.spent / currentBudget.budget.limit) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Budgets</h1>
                    <p className="text-muted-foreground">Set and track your monthly spending limits</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Set Budget
                </Button>
            </div>

            {/* Current Month Budget */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-white/20 p-4">
                            <Target className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">
                                {getMonthName(currentDate.getMonth() + 1)} {currentDate.getFullYear()} Budget
                            </p>
                            {currentBudget ? (
                                <>
                                    <p className="text-3xl font-bold">{formatCurrency(currentBudget.budget.limit)}</p>
                                    <p className="text-sm opacity-90">
                                        {formatCurrency(currentBudget.spent)} spent · {formatCurrency(currentBudget.budget.limit - currentBudget.spent)} remaining
                                    </p>
                                </>
                            ) : (
                                <p className="text-xl">No budget set for this month</p>
                            )}
                        </div>
                    </div>
                </div>
                {currentBudget && (
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{percentUsed}% used</span>
                                {percentUsed > 100 && (
                                    <span className="flex items-center gap-1 text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        Over budget!
                                    </span>
                                )}
                            </div>
                            <Progress
                                value={Math.min(percentUsed, 100)}
                                className="h-3"
                                indicatorClassName={
                                    percentUsed > 100
                                        ? 'bg-red-500'
                                        : percentUsed > 80
                                            ? 'bg-amber-500'
                                            : 'bg-green-500'
                                }
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Budget History */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-8">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">No budgets set yet</p>
                            <Button onClick={openAddModal} variant="outline" className="mt-4">
                                Set your first budget
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((budget) => (
                                <div
                                    key={budget._id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {getMonthName(budget.month)} {budget.year}
                                        </p>
                                        <p className="text-2xl font-bold">{formatCurrency(budget.limit)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditModal(budget)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => deleteBudget(budget._id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set Monthly Budget'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Month</Label>
                                <Select onValueChange={(v) => setValue('month', v)} defaultValue={(currentDate.getMonth() + 1).toString()}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                {getMonthName(i + 1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Select onValueChange={(v) => setValue('year', v)} defaultValue={currentDate.getFullYear().toString()}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2024, 2025, 2026].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="limit">Budget Limit</Label>
                            <Input id="limit" type="number" step="100" placeholder="50000" {...register('limit')} error={errors.limit?.message} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={submitting}>{editingBudget ? 'Save' : 'Set Budget'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
