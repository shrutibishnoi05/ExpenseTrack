'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import api from '@/lib/api';
import { formatCurrency, calculatePercentage, getMonthName } from '@/lib/utils';
import { DashboardSummary, TrendDataPoint } from '@/types';

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [trends, setTrends] = useState<{ expenses: TrendDataPoint[]; income: TrendDataPoint[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNearBudget, setIsNearBudget] = useState(false);
    const [budgetPercentUsed, setBudgetPercentUsed] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, trendsRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/trends?months=6'),
                ]);

                setSummary(summaryRes.data.data.summary);
                setIsNearBudget(summaryRes.data.data.isNearBudget);
                setBudgetPercentUsed(summaryRes.data.data.budgetPercentUsed);
                setTrends(trendsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-lg bg-muted" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-80 rounded-lg bg-muted" />
                    <div className="h-80 rounded-lg bg-muted" />
                </div>
            </div>
        );
    }

    const currentMonth = getMonthName(summary?.month || new Date().getMonth() + 1);

    // Prepare chart data from trends
    const combinedTrendData = trends?.expenses.map((exp, index) => ({
        label: exp.label,
        expenses: exp.amount,
        income: trends.income[index]?.amount || 0,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Your financial overview for {currentMonth} {summary?.year}
                </p>
            </div>

            {/* Budget Alert */}
            {summary?.isOverBudget && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="flex items-center gap-4 py-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <p className="font-semibold text-destructive">Budget Exceeded!</p>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve spent {formatCurrency(summary.totalExpenses)} this month, exceeding your
                                budget of {formatCurrency(summary.budgetLimit)} by{' '}
                                {formatCurrency(Math.abs(summary.budgetRemaining))}.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isNearBudget && !summary?.isOverBudget && (
                <Card className="border-amber-500 bg-amber-500/10">
                    <CardContent className="flex items-center gap-4 py-4">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                        <div>
                            <p className="font-semibold text-amber-700 dark:text-amber-500">Budget Warning</p>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve used {budgetPercentUsed}% of your monthly budget. Only{' '}
                                {formatCurrency(summary?.budgetRemaining || 0)} remaining.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary?.totalExpenses || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            <ArrowDownRight className="mr-1 inline h-3 w-3 text-red-600" />
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary?.totalIncome || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            <ArrowUpRight className="mr-1 inline h-3 w-3 text-green-600" />
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Savings</CardTitle>
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(summary?.savings || 0) < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(summary?.savings || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.savingsPercentage.toFixed(1)}% of income saved
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                            <Target className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{budgetPercentUsed}%</div>
                        <Progress
                            value={Math.min(budgetPercentUsed, 100)}
                            className="mt-2 h-2"
                            indicatorClassName={
                                budgetPercentUsed > 100
                                    ? 'bg-red-500'
                                    : budgetPercentUsed > 80
                                        ? 'bg-amber-500'
                                        : 'bg-green-500'
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Category Breakdown Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={summary.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={2}
                                        dataKey="total"
                                        nameKey="categoryName"
                                        label={({ categoryName, percentage }) =>
                                            `${categoryName}: ${percentage.toFixed(1)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {summary.categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => label}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                No expense data yet
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Income vs Expenses Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {combinedTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={combinedTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                No trend data yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Quick Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Top Categories */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Spending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary?.categoryBreakdown?.slice(0, 5).map((cat) => (
                                <div key={cat.categoryId} className="flex items-center gap-4">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: cat.categoryColor }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{cat.categoryName}</span>
                                            <span className="text-muted-foreground">
                                                {formatCurrency(cat.total)} ({cat.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <Progress value={cat.percentage} className="mt-1 h-2" />
                                    </div>
                                </div>
                            ))}
                            {(!summary?.categoryBreakdown || summary.categoryBreakdown.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">
                                    No expenses recorded yet. Start adding expenses to see your spending breakdown!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Budget Limit</span>
                            <span className="font-medium">{formatCurrency(summary?.budgetLimit || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Budget Remaining</span>
                            <span
                                className={`font-medium ${(summary?.budgetRemaining || 0) < 0 ? 'text-red-600' : 'text-green-600'
                                    }`}
                            >
                                {formatCurrency(summary?.budgetRemaining || 0)}
                            </span>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Savings Rate</span>
                                <span className="font-medium">{summary?.savingsPercentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
