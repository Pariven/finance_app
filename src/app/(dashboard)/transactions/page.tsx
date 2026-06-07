'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction } from '@/types';
import { getCategoryColors } from '@/lib/ai-insights';
import TransactionForm from '@/components/forms/TransactionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { createTransaction, updateTransaction, deleteTransaction, isCreating } = useTransactions();
  const { transactions } = useFinanceStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | undefined>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const colors = getCategoryColors();

  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))].sort();
    return cats;
  }, [transactions]);

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (search && !`${t.description} ${t.category}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter, search]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (editingTxn) {
      updateTransaction({ id: editingTxn.id, data });
    } else {
      createTransaction(data);
    }
    setEditingTxn(undefined);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'].join(','),
      ...filtered.map(t => [t.date, t.type, t.category, t.description, t.amount].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    toast.success('CSV exported!');
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-2 text-white"
            style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}
            onClick={() => { setEditingTxn(undefined); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-10 bg-muted/50"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger className="w-36 bg-muted/50"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
          <SelectTrigger className="w-44 bg-muted/50"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    No transactions found.
                  </td>
                </tr>
              )}
              {filtered.map(txn => {
                const catColor = colors[txn.category] || '#94a3b8';
                return (
                  <tr key={txn.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="py-3.5 px-5 text-sm text-muted-foreground">{formatDate(txn.date)}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                        <span className="text-sm">{txn.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline" className={cn('text-xs border-0',
                        txn.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                        {txn.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-muted-foreground max-w-48 truncate">
                      {txn.description || '—'}
                    </td>
                    <td className={cn('py-3.5 px-5 text-sm font-bold text-right font-mono',
                      txn.type === 'income' ? 'text-income' : 'text-expense')}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(txn)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(txn.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTxn(undefined); }}
        onSubmit={handleSubmit}
        initialData={editingTxn}
        isLoading={isCreating}
      />
    </div>
  );
}
