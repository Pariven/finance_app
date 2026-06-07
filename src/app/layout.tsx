import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finance Dashboard Pro | Personal Finance Manager',
  description:
    'Track your income, expenses, budgets, savings goals, and financial health with AI-powered insights.',
  keywords: ['finance', 'budget', 'savings', 'expense tracker', 'personal finance'],
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen animated-bg`}>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: 'oklch(0.14 0.015 264)',
                border: '1px solid oklch(1 0 0 / 10%)',
                color: 'oklch(0.95 0.005 264)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

