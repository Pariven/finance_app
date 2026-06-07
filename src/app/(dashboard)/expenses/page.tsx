'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import TransactionForm from '@/components/forms/TransactionForm';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown } from 'lucide-react';
import { getCategoryColors } from '@/lib/ai-insights';

export default function ExpensesPage() {
  const { createTransaction, isCreating } = useTransactions();
  const { transactions, selectedDate } = useFinanceStore();
  const [formOpen, setFormOpen] = useState(false);
  const colors = getCategoryColors();

  const expenseTransactions = transactions
    .filter(t => t.type === 'expense' && t.date === selectedDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenseTransactions.reduce((s, t) => s + t.amount, 0);

  const byCategory: Record<string, number> = {};
  expenseTransactions.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const sortedCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-expense" /> Expenses
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Monitor where your money goes</p>
        </div>
        <Button size="sm" className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.6 0.22 15), oklch(0.65 0.2 30))' }}
          onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      {/* Total */}
      <div className="glass-card rounded-2xl border border-rose-500/20 p-6 bg-gradient-to-br from-rose-500/10 to-transparent">
        <p className="text-sm text-muted-foreground mb-1">Total Expenses ({formatDate(selectedDate)})</p>
        <p className="text-4xl font-bold text-expense">{formatCurrency(totalExpenses)}</p>
      </div>

      {/* Category breakdown */}
      <div className="glass-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {sortedCategories.map(([cat, amt]) => {
            const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
            const color = colors[cat] || '#94a3b8';
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {cat}
                  </span>
                  <span className="font-semibold">{formatCurrency(amt)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 text-right">{pct.toFixed(1)}%</p>
              </div>
            );
          })}
          {sortedCategories.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No expenses on {formatDate(selectedDate)}.</p>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Expense Transactions</h3>
        </div>
        <div className="divide-y divide-border">
          {expenseTransactions.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[t.category] || '#94a3b8' }} />
              <div className="flex-1">
                <p className="text-sm font-medium">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {formatDate(t.date)}</p>
              </div>
              <p className="text-expense font-bold text-sm">-{formatCurrency(t.amount)}</p>
            </div>
          ))}
          {expenseTransactions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No expenses on {formatDate(selectedDate)}.</div>
          )}
        </div>
      </div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={data => createTransaction(data)} defaultType="expense" isLoading={isCreating} />
    </div>
  );
}
