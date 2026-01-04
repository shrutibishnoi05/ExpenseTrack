import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Expense } from '../models';
import { AuthRequest } from '../types';

/**
 * Export expenses to CSV
 * GET /api/export/csv
 */
export const exportToCSV = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : new Date();

        const expenses = await Expense.find({
            userId: req.user!.userId,
            date: { $gte: startDate, $lte: endDate },
        })
            .populate('category', 'name')
            .sort({ date: -1 });

        // Format data for CSV
        const csvData = expenses.map((expense) => ({
            Date: expense.date.toISOString().split('T')[0],
            Description: expense.description,
            Category: (expense.category as { name: string })?.name || 'Unknown',
            Amount: expense.amount,
            'Payment Method': expense.paymentMethod,
            Notes: expense.notes || '',
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=expenses_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`
        );
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

/**
 * Export expenses to PDF
 * GET /api/export/pdf
 */
export const exportToPDF = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : new Date();

        const expenses = await Expense.find({
            userId: req.user!.userId,
            date: { $gte: startDate, $lte: endDate },
        })
            .populate('category', 'name color')
            .sort({ date: -1 });

        // Calculate totals
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=expense_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`
        );

        doc.pipe(res);

        // Header
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('Expense Report', { align: 'center' });

        doc.moveDown();
        doc
            .fontSize(12)
            .font('Helvetica')
            .text(
                `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                { align: 'center' }
            );

        doc.moveDown(2);

        // Summary
        doc.fontSize(14).font('Helvetica-Bold').text('Summary');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Expenses: ${expenses.length}`);
        doc.text(`Total Amount: ₹${totalAmount.toLocaleString()}`);

        doc.moveDown(2);

        // Table header
        doc.fontSize(14).font('Helvetica-Bold').text('Expense Details');
        doc.moveDown();

        // Table column positions
        const tableTop = doc.y;
        const dateX = 50;
        const descX = 120;
        const categoryX = 280;
        const amountX = 380;
        const paymentX = 450;

        // Draw header row
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', dateX, tableTop);
        doc.text('Description', descX, tableTop);
        doc.text('Category', categoryX, tableTop);
        doc.text('Amount', amountX, tableTop);
        doc.text('Payment', paymentX, tableTop);

        // Draw line under header
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // Table rows
        let rowY = tableTop + 25;
        doc.font('Helvetica').fontSize(9);

        for (const expense of expenses) {
            if (rowY > 700) {
                doc.addPage();
                rowY = 50;
            }

            doc.text(expense.date.toLocaleDateString(), dateX, rowY);
            doc.text(expense.description.substring(0, 25), descX, rowY);
            doc.text(
                ((expense.category as { name: string })?.name || 'Unknown').substring(0, 15),
                categoryX,
                rowY
            );
            doc.text(`₹${expense.amount.toLocaleString()}`, amountX, rowY);
            doc.text(expense.paymentMethod.replace('_', ' '), paymentX, rowY);

            rowY += 20;
        }

        // Footer
        doc.moveDown(4);
        doc
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Get monthly report data
 * GET /api/export/report
 */
export const getMonthlyReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const month = Number(req.query.month) || new Date().getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const expenses = await Expense.find({
            userId: req.user!.userId,
            date: { $gte: startDate, $lte: endDate },
        })
            .populate('category', 'name color')
            .sort({ date: -1 });

        // Group by category
        const byCategory: Record<string, { name: string; color: string; total: number; count: number }> = {};
        let totalAmount = 0;

        for (const expense of expenses) {
            const category = expense.category as { _id: string; name: string; color: string };
            const catId = category._id.toString();

            if (!byCategory[catId]) {
                byCategory[catId] = {
                    name: category.name,
                    color: category.color,
                    total: 0,
                    count: 0,
                };
            }

            byCategory[catId].total += expense.amount;
            byCategory[catId].count += 1;
            totalAmount += expense.amount;
        }

        res.json({
            success: true,
            data: {
                period: { year, month },
                totalExpenses: expenses.length,
                totalAmount,
                categoryBreakdown: Object.values(byCategory),
                expenses: expenses.map((e) => ({
                    id: e._id,
                    date: e.date,
                    description: e.description,
                    amount: e.amount,
                    category: (e.category as { name: string })?.name,
                    paymentMethod: e.paymentMethod,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};
