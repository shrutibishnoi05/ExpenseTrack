'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Download, FileText, Calendar } from 'lucide-react';
import api from '@/lib/api';

export default function ExportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            setExporting(format);
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/export/${format}?${params.toString()}`, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(null);
        }
    };

    // Quick date presets
    const setPreset = (preset: string) => {
        const today = new Date();
        let start = new Date();

        switch (preset) {
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                today.setDate(0); // Last day of previous month
                break;
            case 'last3Months':
                start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                break;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Export Data</h1>
                <p className="text-muted-foreground">Download your expense data in CSV or PDF format</p>
            </div>

            {/* Date Range Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Select Date Range
                    </CardTitle>
                    <CardDescription>Choose the period for your export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreset('thisMonth')}>This Month</Button>
                        <Button variant="outline" size="sm" onClick={() => setPreset('lastMonth')}>Last Month</Button>
                        <Button variant="outline" size="sm" onClick={() => setPreset('last3Months')}>Last 3 Months</Button>
                        <Button variant="outline" size="sm" onClick={() => setPreset('thisYear')}>This Year</Button>
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Options */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* CSV Export */}
                <Card className="transition-all hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            Export as CSV
                        </CardTitle>
                        <CardDescription>
                            Download your data in CSV format for use in spreadsheet applications like Excel or Google Sheets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                            <li>✓ Compatible with Excel, Google Sheets</li>
                            <li>✓ Easy to filter and analyze</li>
                            <li>✓ Includes all expense details</li>
                        </ul>
                        <Button
                            onClick={() => handleExport('csv')}
                            className="w-full gap-2"
                            disabled={exporting !== null}
                            loading={exporting === 'csv'}
                        >
                            <Download className="h-4 w-4" />
                            Download CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* PDF Export */}
                <Card className="transition-all hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            Export as PDF
                        </CardTitle>
                        <CardDescription>
                            Generate a formatted PDF report with your expense summary and details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                            <li>✓ Professional formatted report</li>
                            <li>✓ Ready for printing</li>
                            <li>✓ Easy to share</li>
                        </ul>
                        <Button
                            onClick={() => handleExport('pdf')}
                            variant="outline"
                            className="w-full gap-2"
                            disabled={exporting !== null}
                            loading={exporting === 'pdf'}
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
