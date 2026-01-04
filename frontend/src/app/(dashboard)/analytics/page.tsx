'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import api from '@/lib/api';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [yearlyData, setYearlyData] = useState<any>(null);
    const [dailyData, setDailyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, trendsRes, yearlyRes, dailyRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/trends?months=12'),
                    api.get(`/analytics/yearly?year=${selectedYear}`),
                    api.get('/analytics/daily'),
                ]);

                setSummary(summaryRes.data.data.summary);
                setTrends(trendsRes.data.data);
                setYearlyData(yearlyRes.data.data);
                setDailyData(dailyRes.data.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 rounded bg-muted" />
                <div className="grid gap-6 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-80 rounded-lg bg-muted" />
                    ))}
                </div>
            </div>
        );
    }

    // Prepare combined trend data
    const combinedTrends = trends?.expenses.map((exp: any, index: number) => ({
        label: exp.label,
        expenses: exp.amount,
        income: trends.income[index]?.amount || 0,
        savings: (trends.income[index]?.amount || 0) - exp.amount,
    })) || [];

    // Monthly breakdown for current year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyBreakdown = monthNames.map((name, index) => {
        const monthData = yearlyData?.monthlyBreakdown?.find((m: any) => m.month === index + 1);
        return {
            month: name,
            amount: monthData?.total || 0,
        };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
                </div>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Yearly Expenses</p>
                                <p className="text-2xl font-bold">{formatCurrency(yearlyData?.totalExpenses || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Yearly Income</p>
                                <p className="text-2xl font-bold">{formatCurrency(yearlyData?.totalIncome || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Yearly Savings</p>
                                <p className="text-2xl font-bold">{formatCurrency(yearlyData?.savings || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. Monthly</p>
                                <p className="text-2xl font-bold">{formatCurrency(yearlyData?.averageMonthlyExpense || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* 12-Month Trend */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Income vs Expenses (Last 12 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={combinedTrends}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary?.categoryBreakdown?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={summary.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="total"
                                        nameKey="categoryName"
                                    >
                                        {summary.categoryBreakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Spending ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="amount" name="Expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Daily Spending Line */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Spending This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyData?.dailySpending?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dailyData.dailySpending}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(l) => `Day ${l}`} />
                                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                                No spending data for this month
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
