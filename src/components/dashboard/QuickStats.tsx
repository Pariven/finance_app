'use client';

import { useMemo } from 'react';
import { Activity, ShoppingBag, TrendingUp, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Transaction } from '@/types';

interface QuickStatsProps {
  transactions: Transaction[];
  date: string;
}

export default function QuickStats({ transactions, date }: QuickStatsProps) {
  const stats = useMemo(() => {
    const filtered = transactions.filter(t => t.date === date);

    const expenses = filtered.filter(t => t.type === 'expense');
    const income = filtered.filter(t => t.type === 'income');
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);

    // Top category for the day
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

    // Daily growth (vs yesterday)
    const selectedDateObj = new Date(date);
    const yesterdayObj = new Date(selectedDateObj);
    yesterdayObj.setDate(selectedDateObj.getDate() - 1);
    const yesterdayString = yesterdayObj.toISOString().split('T')[0];

    const prevExpenses = transactions
      .filter(t => t.type === 'expense' && t.date === yesterdayString)
      .reduce((s, t) => s + t.amount, 0);
    
    const growth = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    // Daily Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return { totalExpenses, topCategory, growth, savingsRate };
  }, [transactions, date]);

  const items = [
    {
      label: 'Daily Spend',
      value: formatCurrency(stats.totalExpenses),
      icon: Activity,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Top Category',
      value: stats.topCategory ? stats.topCategory[0] : 'N/A',
      sub: stats.topCategory ? formatCurrency(stats.topCategory[1]) : '',
      icon: ShoppingBag,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Daily Growth',
      value: `${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.growth <= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: stats.growth <= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
    {
      label: 'Savings Rate',
      value: `${Math.max(0, stats.savingsRate).toFixed(1)}%`,
      icon: Percent,
      color: stats.savingsRate >= 20 ? 'text-emerald-400' : stats.savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400',
      bg: stats.savingsRate >= 20 ? 'bg-emerald-500/10' : stats.savingsRate >= 10 ? 'bg-amber-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-card rounded-2xl p-4 border border-border card-hover">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${item.bg}`}>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}
