import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, ThemeProvider } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ExpenseTrack - Smart Expense Management',
    description: 'Track your expenses, manage budgets, and gain financial insights with our powerful expense tracking application.',
    keywords: ['expense tracker', 'budget management', 'financial planning', 'money management'],
    authors: [{ name: 'ExpenseTrack Team' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>{children}</AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
