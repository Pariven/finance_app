'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { buildCategoryData } from '@/lib/ai-insights';
import { BarChart3 } from 'lucide-react';

import { ReactNode } from 'react';

interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-border rounded-xl p-3 text-sm">
      {label && <p className="text-muted-foreground mb-1 font-medium">{label}</p>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.dataKey || p.name} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  useTransactions();
  const { transactions } = useFinanceStore();

  const categoryData = useMemo(() => buildCategoryData(transactions), [transactions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const year = now.getFullYear();
      const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { name: getMonthName(month), income, expenses, savings: Math.max(0, income - expenses) };
    });
  }, [transactions]);

  const spendingTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const m = d.getMonth() + 1; const y = d.getFullYear();
      const expenses = transactions
        .filter(t => { const td = new Date(t.date); return t.type === 'expense' && td.getMonth() + 1 === m && td.getFullYear() === y; })
        .reduce((s, t) => s + t.amount, 0);
      return { name: getMonthName(m), expenses };
    });
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Visual breakdown of your finances</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-1">Expense Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">By category (all time)</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie data={categoryData} dataKey="amount" nameKey="category" cx="50%" cy="50%"
                  outerRadius={100} innerRadius={50} paddingAngle={3}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(props: any) => `${props.category}: ${Number(props.percentage).toFixed(0)}%`}
                  labelLine={false}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No expense data available
            </div>
          )}
        </div>

        {/* Bar Chart — Monthly spending */}
        <div className="glass-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-1">Monthly Spending</h3>
          <p className="text-xs text-muted-foreground mb-4">{new Date().getFullYear()} overview</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis dataKey="name" tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `RM${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expenses" name="Expenses" fill="oklch(0.6 0.22 15)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="income" name="Income" fill="oklch(0.6 0.18 145)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — Spending trend */}
        <div className="glass-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-1">Spending Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spendingTrend} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis dataKey="name" tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `RM${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="oklch(0.58 0.22 293)"
                strokeWidth={3} dot={{ fill: 'oklch(0.58 0.22 293)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart — Income vs Expenses */}
        <div className="glass-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-1">Income vs Expenses</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly cash flow comparison</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.6 0.22 15)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.6 0.22 15)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis dataKey="name" tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `RM${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="oklch(0.6 0.18 145)"
                strokeWidth={2} fill="url(#incG)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="oklch(0.6 0.22 15)"
                strokeWidth={2} fill="url(#expG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
