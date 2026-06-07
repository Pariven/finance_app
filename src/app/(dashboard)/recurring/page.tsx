'use client';

import { useState } from 'react';
import { useRecurring } from '@/hooks/useRecurring';
import { useFinanceStore } from '@/store/useFinanceStore';
import { RecurringExpense } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RefreshCcw, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXPENSE_CATEGORIES = [
  'Food & Drinks', 'Groceries', 'Transport', 'Utilities', 'Internet',
  'Healthcare', 'Insurance', 'Shopping', 'Entertainment', 'Education',
];

export default function RecurringPage() {
  const { createRecurring, toggleRecurring, deleteRecurring } = useRecurring();
  const { recurring } = useFinanceStore();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDay, setDueDay] = useState('1');

  const today = new Date().getDate();
  const activeItems = recurring.filter(r => r.is_active);
  const totalMonthly = activeItems.reduce((s, r) => s + r.amount, 0);
  const upcoming = activeItems.filter(r => r.due_day >= today && r.due_day <= today + 7).sort((a, b) => a.due_day - b.due_day);

  const handleCreate = () => {
    if (!name || !amount || !category) return;
    createRecurring({ name, amount: parseFloat(amount), category, due_day: parseInt(dueDay), is_active: true });
    setFormOpen(false); setName(''); setAmount(''); setCategory(''); setDueDay('1');
  };

  const getDueDayLabel = (day: number) => {
    const diff = day - today;
    if (diff < 0) return 'Paid this month';
    if (diff === 0) return 'Due today!';
    if (diff <= 3) return `Due in ${diff} day${diff !== 1 ? 's' : ''}`;
    return `Due on day ${day}`;
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCcw className="w-6 h-6 text-violet-400" /> Recurring Bills
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your monthly subscriptions and bills</p>
        </div>
        <Button size="sm" className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}
          onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Add Bill
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-violet-500/20 p-5 bg-gradient-to-br from-violet-500/10 to-transparent">
          <p className="text-xs text-muted-foreground mb-1">Monthly Total</p>
          <p className="text-2xl font-bold text-savings">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="glass-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Active Bills</p>
          <p className="text-2xl font-bold">{activeItems.length}</p>
        </div>
        <div className="glass-card rounded-2xl border border-amber-500/20 p-5 bg-gradient-to-br from-amber-500/10 to-transparent">
          <p className="text-xs text-muted-foreground mb-1">Due This Week</p>
          <p className="text-2xl font-bold text-amber-400">{upcoming.length}</p>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="glass-card rounded-2xl border border-amber-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold">Upcoming This Week</h3>
          </div>
          <div className="space-y-3">
            {upcoming.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-amber-400">{getDueDayLabel(item.due_day)}</p>
                </div>
                <p className="font-bold">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All bills */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">All Recurring Bills</h3>
        </div>
        <div className="divide-y divide-border">
          {recurring.map(item => (
            <div key={item.id}
              className={cn('flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors',
                !item.is_active && 'opacity-50')}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.58 0.22 293 / 20%)' }}>
                <RefreshCcw className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category} · Due on day {item.due_day}</p>
              </div>
              <div className="text-right mr-4">
                <p className="font-bold">{formatCurrency(item.amount)}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRecurring({ id: item.id, is_active: !item.is_active })}
                  className="text-muted-foreground hover:text-primary transition-colors">
                  {item.is_active
                    ? <ToggleRight className="w-5 h-5 text-primary" />
                    : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteRecurring(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {recurring.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No recurring bills added yet.</div>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Add Recurring Bill</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Netflix" className="bg-muted/50"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Amount (RM)</Label>
              <Input type="number" placeholder="55.00" className="bg-muted/50"
                value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
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
              <Label>Due Day of Month</Label>
              <Input type="number" min="1" max="31" placeholder="1" className="bg-muted/50"
                value={dueDay} onChange={e => setDueDay(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
                Add Bill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
