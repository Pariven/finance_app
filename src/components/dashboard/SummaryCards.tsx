'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Transaction } from '@/types';

interface SummaryCardsProps {
  transactions: Transaction[];
  date: string;
}

export default function SummaryCards({ transactions, date }: SummaryCardsProps) {
  const { totalIncome, totalExpenses, savings, balance } = useMemo(() => {
    const filtered = transactions.filter(t => t.date === date);
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      savings: Math.max(0, income - expenses),
      balance: income - expenses,
    };
  }, [transactions, date]);

  const cards = [
    {
      label: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/20',
      valueColor: 'text-income',
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      trend: '-5%',
      trendUp: false,
      gradient: 'from-rose-500/20 to-rose-600/10',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/20',
      borderColor: 'border-rose-500/20',
      valueColor: 'text-expense',
    },
    {
      label: 'Savings',
      value: savings,
      icon: PiggyBank,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-violet-500/20 to-violet-600/10',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/20',
      borderColor: 'border-violet-500/20',
      valueColor: 'text-savings',
    },
    {
      label: 'Net Balance',
      value: Math.abs(balance),
      icon: Wallet,
      trend: balance >= 0 ? 'Surplus' : 'Deficit',
      trendUp: balance >= 0,
      gradient: balance >= 0 ? 'from-sky-500/20 to-sky-600/10' : 'from-orange-500/20 to-orange-600/10',
      iconColor: balance >= 0 ? 'text-sky-400' : 'text-orange-400',
      iconBg: balance >= 0 ? 'bg-sky-500/20' : 'bg-orange-500/20',
      borderColor: balance >= 0 ? 'border-sky-500/20' : 'border-orange-500/20',
      valueColor: balance >= 0 ? 'text-income' : 'text-expense',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`glass-card rounded-2xl p-5 border card-hover bg-gradient-to-br ${card.gradient} ${card.borderColor}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {card.trendUp
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.valueColor} animate-count`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
