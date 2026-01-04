'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from '@/components/ui';
import { Plus, Search, Filter, Edit, Trash2, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Expense, Category, ExpenseFormData, ExpenseQueryParams } from '@/types';

const expenseSchema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    category: z.string().min(1, 'Category is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(2, 'Description is required'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'net_banking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'other', label: 'Other' },
];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState<ExpenseQueryParams>({ page: 1, limit: 10 });
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseForm>({
        resolver: zodResolver(expenseSchema),
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/expenses?${params.toString()}`);
            setExpenses(response.data.data.expenses);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, [filters]);

    const openAddModal = () => {
        setEditingExpense(null);
        reset({
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            paymentMethod: 'cash',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        reset({
            amount: expense.amount.toString(),
            category: expense.category._id,
            date: new Date(expense.date).toISOString().split('T')[0],
            description: expense.description,
            paymentMethod: expense.paymentMethod,
            notes: expense.notes || '',
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: ExpenseForm) => {
        try {
            setSubmitting(true);
            const payload = {
                amount: parseFloat(data.amount),
                category: data.category,
                date: data.date,
                description: data.description,
                paymentMethod: data.paymentMethod || 'cash',
                notes: data.notes,
            };

            if (editingExpense) {
                await api.put(`/expenses/${editingExpense._id}`, payload);
            } else {
                await api.post('/expenses', payload);
            }

            setIsModalOpen(false);
            fetchExpenses();
        } catch (error: any) {
            console.error('Failed to save expense:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteExpense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    const handleSearch = () => {
        setFilters({ ...filters, page: 1 });
        fetchExpenses();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Expenses</h1>
                    <p className="text-muted-foreground">Track and manage your expenses</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search expenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" onClick={handleSearch}>
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(value: string) => setFilters({ ...filters, category: value === 'all' ? undefined : value, page: 1 })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Receipt className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No expenses found</h3>
                            <p className="text-sm text-muted-foreground">Start by adding your first expense</p>
                            <Button onClick={openAddModal} className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {expenses.map((expense) => (
                                        <tr key={expense._id} className="hover:bg-muted/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">{formatDate(expense.date)}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{expense.description}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                    style={{ backgroundColor: expense.category.color + '20', color: expense.category.color }}
                                                >
                                                    {expense.category.name}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground capitalize">
                                                {expense.paymentMethod.replace('_', ' ')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(expense)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense._id)}>
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
                    {expenses.length > 0 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
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
                        <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('amount')}
                                error={errors.amount?.message}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(value: string) => setValue('category', value)} defaultValue={editingExpense?.category._id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" {...register('date')} error={errors.date?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="What was this expense for?" {...register('description')} error={errors.description?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select onValueChange={(value: string) => setValue('paymentMethod', value)} defaultValue={editingExpense?.paymentMethod || 'cash'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input id="notes" placeholder="Additional notes" {...register('notes')} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={submitting}>
                                {editingExpense ? 'Save Changes' : 'Add Expense'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
