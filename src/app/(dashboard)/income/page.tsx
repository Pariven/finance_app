'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import TransactionForm from '@/components/forms/TransactionForm';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';

export default function IncomePage() {
  const { createTransaction, isCreating } = useTransactions();
  const { transactions, selectedDate } = useFinanceStore();
  const [formOpen, setFormOpen] = useState(false);

  const incomeTransactions = transactions
    .filter(t => t.type === 'income' && t.date === selectedDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);

  const byCategory: Record<string, number> = {};
  incomeTransactions.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-income" /> Income
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track all your income sources</p>
        </div>
        <Button size="sm" className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.65 0.18 175))' }}
          onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Add Income
        </Button>
      </div>

      {/* Total */}
      <div className="glass-card rounded-2xl border border-emerald-500/20 p-6 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <p className="text-sm text-muted-foreground mb-1">Total Income ({formatDate(selectedDate)})</p>
        <p className="text-4xl font-bold text-income">{formatCurrency(totalIncome)}</p>
      </div>

      {/* By source */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(byCategory).map(([cat, amt]) => (
          <div key={cat} className="glass-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-income" />
              <span className="text-sm font-medium">{cat}</span>
            </div>
            <p className="text-xl font-bold text-income">{formatCurrency(amt)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(0) : 0}% of total
            </p>
          </div>
        ))}
      </div>

      {/* Transactions list */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Income Transactions</h3>
        </div>
        <div className="divide-y divide-border">
          {incomeTransactions.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30">
              <div className="flex-1">
                <p className="text-sm font-medium">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {formatDate(t.date)}</p>
              </div>
              <p className="text-income font-bold text-sm">+{formatCurrency(t.amount)}</p>
            </div>
          ))}
          {incomeTransactions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No income recorded on {formatDate(selectedDate)}.
            </div>
          )}
        </div>
      </div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={data => createTransaction(data)} defaultType="income" isLoading={isCreating} />
    </div>
  );
}
