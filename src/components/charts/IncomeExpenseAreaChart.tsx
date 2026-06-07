'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/formatters';

interface IncomeExpenseAreaChartProps {
  transactions: Transaction[];
}

interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-border rounded-xl p-3 text-sm">
        <p className="text-muted-foreground mb-2 font-medium">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseAreaChart({ transactions }: IncomeExpenseAreaChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    return months.map(({ month, year }) => {
      const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { name: getMonthName(month), income, expenses, savings: Math.max(0, income - expenses) };
    });
  }, [transactions]);

  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="mb-5">
        <h3 className="font-semibold text-foreground">Income vs Expenses</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last 6 months cash flow</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.6 0.22 15)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.6 0.22 15)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
          <XAxis dataKey="name" tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `RM${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'oklch(0.7 0.01 264)' }} />
          <Area type="monotone" dataKey="income" name="Income" stroke="oklch(0.6 0.18 145)"
            strokeWidth={2} fill="url(#incomeGrad)" />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="oklch(0.6 0.22 15)"
            strokeWidth={2} fill="url(#expenseGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
