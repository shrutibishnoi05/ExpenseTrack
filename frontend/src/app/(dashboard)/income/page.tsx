'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from '@/components/ui';
import { Plus, Search, Edit, Trash2, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Income } from '@/types';

const incomeSchema = z.object({
    source: z.string().min(2, 'Source is required'),
    amount: z.string().min(1, 'Amount is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringFrequency: z.string().optional(),
});

type IncomeForm = z.infer<typeof incomeSchema>;

const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

export default function IncomePage() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<IncomeForm>({
        resolver: zodResolver(incomeSchema),
        defaultValues: { isRecurring: false },
    });

    const isRecurring = watch('isRecurring');

    const fetchIncomes = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/incomes?${params.toString()}`);
            setIncomes(response.data.data.incomes);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch incomes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const openAddModal = () => {
        setEditingIncome(null);
        reset({
            source: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            isRecurring: false,
            recurringFrequency: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (income: Income) => {
        setEditingIncome(income);
        reset({
            source: income.source,
            amount: income.amount.toString(),
            date: new Date(income.date).toISOString().split('T')[0],
            description: income.description || '',
            isRecurring: income.isRecurring,
            recurringFrequency: income.recurringFrequency || '',
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: IncomeForm) => {
        try {
            setSubmitting(true);
            const payload = {
                source: data.source,
                amount: parseFloat(data.amount),
                date: data.date,
                description: data.description,
                isRecurring: data.isRecurring || false,
                recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
            };

            if (editingIncome) {
                await api.put(`/incomes/${editingIncome._id}`, payload);
            } else {
                await api.post('/incomes', payload);
            }

            setIsModalOpen(false);
            fetchIncomes(pagination.page);
        } catch (error) {
            console.error('Failed to save income:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteIncome = async (id: string) => {
        if (!confirm('Are you sure you want to delete this income entry?')) return;
        try {
            await api.delete(`/incomes/${id}`);
            fetchIncomes(pagination.page);
        } catch (error) {
            console.error('Failed to delete income:', error);
        }
    };

    // Calculate total income
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Income</h1>
                    <p className="text-muted-foreground">Track your income sources</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Income
                </Button>
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-white/20 p-4">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Total Income (This Page)</p>
                            <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search income sources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchIncomes(1)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" onClick={() => fetchIncomes(1)}>Search</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Income List */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : incomes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No income recorded</h3>
                            <p className="text-sm text-muted-foreground">Start by adding your income sources</p>
                            <Button onClick={openAddModal} className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Income
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Recurring</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {incomes.map((income) => (
                                        <tr key={income._id} className="hover:bg-muted/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">{formatDate(income.date)}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{income.source}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{income.description || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {income.isRecurring ? (
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {income.recurringFrequency}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-600">
                                                +{formatCurrency(income.amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(income)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteIncome(income._id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {incomes.length > 0 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchIncomes(pagination.page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchIncomes(pagination.page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="source">Source</Label>
                            <Input id="source" placeholder="e.g., Salary, Freelance, Investment" {...register('source')} error={errors.source?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} error={errors.amount?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" {...register('date')} error={errors.date?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input id="description" placeholder="Additional details" {...register('description')} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isRecurring" {...register('isRecurring')} className="h-4 w-4 rounded border-gray-300" />
                            <Label htmlFor="isRecurring">Recurring income</Label>
                        </div>

                        {isRecurring && (
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select onValueChange={(v) => setValue('recurringFrequency', v)} defaultValue={editingIncome?.recurringFrequency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frequencies.map((f) => (
                                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={submitting}>{editingIncome ? 'Save Changes' : 'Add Income'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
