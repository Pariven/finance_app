'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FileText, TrendingUp, TrendingDown, PiggyBank, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

import { ReactElement } from 'react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3`}
        style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  useTransactions();
  const { transactions, selectedDate } = useFinanceStore();
  const today = new Date(selectedDate);

  const daily = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const txns = transactions.filter(t => t.date === todayStr);
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses, txns };
  }, [transactions, today]);

  const weekly = useMemo(() => {
    const start = format(startOfWeek(today), 'yyyy-MM-dd');
    const end = format(endOfWeek(today), 'yyyy-MM-dd');
    const txns = transactions.filter(t => t.date >= start && t.date <= end);
    const expenses = txns.filter(t => t.type === 'expense');
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    const topCats = Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 3);
    return { income, expenses: totalExp, balance: income - totalExp, topCats, txns };
  }, [transactions, today]);

  const monthly = useMemo(() => {
    const m = today.getMonth() + 1; const y = today.getFullYear();
    const txns = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() + 1 === m && d.getFullYear() === y; });
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevM = m === 1 ? 12 : m - 1; const prevY = m === 1 ? y - 1 : y;
    const prevExp = transactions.filter(t => { const d = new Date(t.date); return t.type === 'expense' && d.getMonth() + 1 === prevM && d.getFullYear() === prevY; }).reduce((s, t) => s + t.amount, 0);
    const growth = prevExp > 0 ? ((expenses - prevExp) / prevExp) * 100 : 0;
    return { income, expenses, savings: Math.max(0, income - expenses), growth };
  }, [transactions, today]);

  const yearly = useMemo(() => {
    const y = today.getFullYear();
    const txns = transactions.filter(t => new Date(t.date).getFullYear() === y);
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings: Math.max(0, income - expenses), year: y };
  }, [transactions, today]);

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Financial summaries across time periods</p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4 mt-4">
          <p className="text-muted-foreground text-sm">{format(today, 'EEEE, dd MMMM yyyy')}</p>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Income" value={formatCurrency(daily.income)} icon={TrendingUp} color="oklch(0.6 0.18 145)" />
            <StatCard label="Expenses" value={formatCurrency(daily.expenses)} icon={TrendingDown} color="oklch(0.6 0.22 15)" />
            <StatCard label="Balance" value={formatCurrency(daily.balance)} icon={DollarSign} color="oklch(0.58 0.22 293)" />
          </div>
          <div className="glass-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="font-semibold text-sm">Today&apos;s Transactions</h3></div>
            <div className="divide-y divide-border">
              {daily.txns.map(t => (
                <div key={t.id} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-muted-foreground">{t.category} — {t.description || '—'}</span>
                  <span className={t.type === 'income' ? 'text-income font-medium' : 'text-expense font-medium'}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
              {daily.txns.length === 0 && <div className="py-8 text-center text-muted-foreground text-sm">No transactions today.</div>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <p className="text-muted-foreground text-sm">
            {format(startOfWeek(today), 'dd MMM')} — {format(endOfWeek(today), 'dd MMM yyyy')}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Weekly Income" value={formatCurrency(weekly.income)} icon={TrendingUp} color="oklch(0.6 0.18 145)" />
            <StatCard label="Weekly Spending" value={formatCurrency(weekly.expenses)} icon={TrendingDown} color="oklch(0.6 0.22 15)" />
            <StatCard label="Balance" value={formatCurrency(weekly.balance)} icon={DollarSign} color="oklch(0.58 0.22 293)" />
          </div>
          {weekly.topCats.length > 0 && (
            <div className="glass-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold mb-3">Top Spending Categories</h3>
              <div className="space-y-2">
                {weekly.topCats.map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-semibold">{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <p className="text-muted-foreground text-sm">{format(today, 'MMMM yyyy')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Income" value={formatCurrency(monthly.income)} icon={TrendingUp} color="oklch(0.6 0.18 145)" />
            <StatCard label="Total Expenses" value={formatCurrency(monthly.expenses)} icon={TrendingDown} color="oklch(0.6 0.22 15)" />
            <StatCard label="Savings" value={formatCurrency(monthly.savings)} icon={PiggyBank} color="oklch(0.58 0.22 293)" />
            <StatCard label="Growth" value={`${monthly.growth > 0 ? '+' : ''}${monthly.growth.toFixed(1)}%`}
              icon={TrendingUp} color={monthly.growth <= 0 ? 'oklch(0.6 0.18 145)' : 'oklch(0.6 0.22 15)'} />
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-4">
          <p className="text-muted-foreground text-sm">Year {yearly.year} Overview</p>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Income" value={formatCurrency(yearly.income)} icon={TrendingUp} color="oklch(0.6 0.18 145)" />
            <StatCard label="Total Expenses" value={formatCurrency(yearly.expenses)} icon={TrendingDown} color="oklch(0.6 0.22 15)" />
            <StatCard label="Yearly Savings" value={formatCurrency(yearly.savings)} icon={PiggyBank} color="oklch(0.58 0.22 293)" />
          </div>
          <div className="glass-card rounded-2xl border border-border p-5">
            <p className="text-sm text-muted-foreground">
              Savings Rate: <span className="font-bold text-foreground">
                {yearly.income > 0 ? ((yearly.savings / yearly.income) * 100).toFixed(1) : 0}%
              </span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
