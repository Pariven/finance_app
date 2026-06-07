'use client';

import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Budget } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, PieChart, AlertTriangle, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXPENSE_CATEGORIES = [
  'Food & Drinks', 'Groceries', 'Transport', 'Fuel', 'Rent', 'Utilities', 'Internet',
  'Healthcare', 'Insurance', 'Shopping', 'Entertainment', 'Travel', 'Dining Out',
  'Education', 'Savings', 'Investments',
];

export default function BudgetsPage() {
  const { createBudget, deleteBudget } = useBudgets();
  useTransactions(); // ensure loaded
  const { budgets, transactions, selectedDate } = useFinanceStore();

  const selectedDateObj = new Date(selectedDate);
  const budgetMonth = selectedDateObj.getMonth() + 1;
  const budgetYear = selectedDateObj.getFullYear();
  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const budgetsWithSpending = budgets
    .filter(b => b.month === budgetMonth && b.year === budgetYear)
    .map(budget => {
      const spent = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.category === budget.category &&
          d.getMonth() + 1 === budget.month && d.getFullYear() === budget.year;
      }).reduce((s, t) => s + t.amount, 0);
      const pct = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
      const status = pct >= 100 ? 'exceeded' : pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'safe';
      return { ...budget, spent, pct, status };
    });

  const handleCreate = () => {
    if (!category || !limit) return;
    createBudget({ category, limit_amount: parseFloat(limit), month: budgetMonth, year: budgetYear });
    setFormOpen(false); setCategory(''); setLimit('');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'exceeded') return <XCircle className="w-4 h-4 text-rose-400" />;
    if (status === 'danger') return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="w-6 h-6 text-violet-400" /> Budgets
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Monthly spending limits by category</p>
        </div>
        <Button size="sm" className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}
          onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> New Budget
        </Button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetsWithSpending.map(b => {
          const barColor = b.status === 'exceeded' ? 'oklch(0.6 0.22 15)'
            : b.status === 'danger' ? 'oklch(0.65 0.2 30)'
            : b.status === 'warning' ? 'oklch(0.75 0.15 65)'
            : 'oklch(0.6 0.18 145)';

          return (
            <div key={b.id} className="glass-card rounded-2xl border border-border p-5 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <StatusIcon status={b.status} />
                  <h3 className="font-semibold">{b.category}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => deleteBudget(b.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Spent: <span className="text-foreground font-medium">{formatCurrency(b.spent)}</span></span>
                <span className="text-muted-foreground">Limit: <span className="text-foreground font-medium">{formatCurrency(b.limit_amount)}</span></span>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, b.pct)}%`, background: barColor }} />
              </div>

              <div className="flex justify-between items-center">
                <span className={cn('text-xs font-medium',
                  b.status === 'exceeded' ? 'text-rose-400' :
                  b.status === 'danger' ? 'text-orange-400' :
                  b.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {b.pct.toFixed(0)}% used
                  {b.status === 'warning' && ' — Warning!'}
                  {b.status === 'danger' && ' — Almost exceeded!'}
                  {b.status === 'exceeded' && ' — Budget exceeded!'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {b.limit_amount - b.spent > 0
                    ? `${formatCurrency(b.limit_amount - b.spent)} left`
                    : `${formatCurrency(b.spent - b.limit_amount)} over`}
                </span>
              </div>
            </div>
          );
        })}
        {budgetsWithSpending.length === 0 && (
          <div className="col-span-2 glass-card rounded-2xl border border-border p-12 text-center">
            <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No budgets for this month. Create your first budget!</p>
          </div>
        )}
      </div>

      {/* Create Budget Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Create Budget</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Limit (RM)</Label>
              <Input type="number" step="0.01" placeholder="500.00" className="bg-muted/50"
                value={limit} onChange={e => setLimit(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
                Create Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
