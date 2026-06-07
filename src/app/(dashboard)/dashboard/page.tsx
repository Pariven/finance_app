'use client';

import { useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useFinanceStore } from '@/store/useFinanceStore';
import { calculateHealthScore } from '@/lib/health-score';
import SummaryCards from '@/components/dashboard/SummaryCards';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import IncomeExpenseAreaChart from '@/components/charts/IncomeExpenseAreaChart';
import { Heart, Sparkles, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/formatters';
import { BudgetWithSpending } from '@/types';
import InstallAppButton from '@/components/dashboard/InstallAppButton';

export default function DashboardPage() {
  const { data: transactions = [], isLoading: txnLoading } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { selectedDate, transactions: storeTransactions } = useFinanceStore();

  const selectedDateObj = new Date(selectedDate);
  const budgetMonth = selectedDateObj.getMonth() + 1;
  const budgetYear = selectedDateObj.getFullYear();

  const budgetsWithSpending = budgets.map(budget => {
    const spent = storeTransactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.category === budget.category &&
          d.getMonth() + 1 === budgetMonth && d.getFullYear() === budgetYear;
      })
      .reduce((s, t) => s + t.amount, 0);
    const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
    return {
      ...budget, spent, percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'safe',
    } as const;
  });

  const healthScore = calculateHealthScore(storeTransactions, budgetsWithSpending as BudgetWithSpending[]);

  const scoreColor = healthScore.total >= 90 ? '#10b981'
    : healthScore.total >= 75 ? '#6366f1'
    : healthScore.total >= 50 ? '#f59e0b'
    : '#ef4444';

  if (txnLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {formatDate(selectedDate)} overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InstallAppButton />
          <Link href="/ai-insights" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Insights
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards transactions={storeTransactions} date={selectedDate} />

      {/* Quick Stats */}
      <QuickStats transactions={storeTransactions} date={selectedDate} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart — takes 2 cols */}
        <div className="xl:col-span-2">
          <IncomeExpenseAreaChart transactions={storeTransactions} />
        </div>

        {/* Health Score & Quick Actions */}
        <div className="space-y-4">
          {/* Health Score Card */}
          <Link href="/health-score" className="glass-card rounded-2xl border border-border p-5 block card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-sm text-foreground">Financial Health</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - healthScore.total / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{healthScore.total}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold" style={{ color: scoreColor }}>
                  {healthScore.level.charAt(0).toUpperCase() + healthScore.level.slice(1)}
                </p>
                <p className="text-xs text-muted-foreground">Score out of 100</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {healthScore.factors.length} factors analyzed
                </p>
              </div>
            </div>
          </Link>

          {/* Budget warnings */}
          <div className="glass-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Budget Status</h3>
              <Link href="/budgets" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {budgetsWithSpending.slice(0, 4).map(b => (
                <div key={b.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{b.category}</span>
                    <span className={
                      b.status === 'exceeded' ? 'text-expense' :
                      b.status === 'danger' ? 'text-orange-400' :
                      b.status === 'warning' ? 'text-amber-400' : 'text-income'
                    }>
                      {b.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, b.percentage)}%`,
                        background: b.status === 'exceeded' ? 'oklch(0.6 0.22 15)'
                          : b.status === 'danger' ? 'oklch(0.65 0.2 30)'
                          : b.status === 'warning' ? 'oklch(0.75 0.15 65)'
                          : 'oklch(0.6 0.18 145)',
                      }}
                    />
                  </div>
                </div>
              ))}
              {budgetsWithSpending.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No budgets set. <Link href="/budgets" className="text-primary hover:underline">Create one</Link>
                </p>
              )}
            </div>
          </div>

          {/* Upcoming recurring */}
          <div className="glass-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCcw className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-sm text-foreground">Upcoming Bills</h3>
            </div>
            <Link href="/recurring" className="text-xs text-primary hover:underline block text-right -mt-6 mb-4">View all</Link>
            <p className="text-xs text-muted-foreground">
              Check the <Link href="/recurring" className="text-primary hover:underline">Recurring Bills</Link> page for upcoming payments.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={storeTransactions} />
    </div>
  );
}
