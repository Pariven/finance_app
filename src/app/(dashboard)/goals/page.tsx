'use client';

import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Target, Calendar, Trash2, PlusCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function GoalsPage() {
  const { createGoal, deleteGoal, addContribution } = useGoals();
  const { goals } = useFinanceStore();
  const [formOpen, setFormOpen] = useState(false);
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleCreate = () => {
    if (!name || !target) return;
    createGoal({ name, target_amount: parseFloat(target), saved_amount: 0, target_date: targetDate || undefined });
    setFormOpen(false); setName(''); setTarget(''); setTargetDate('');
  };

  const handleContribute = () => {
    if (!contribGoal || !contribAmount) return;
    addContribution({ goalId: contribGoal.id, amount: parseFloat(contribAmount) });
    setContribGoal(null); setContribAmount('');
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-violet-400" /> Savings Goals
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your financial milestones</p>
        </div>
        <Button size="sm" className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}
          onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const pct = goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
          const remaining = goal.target_amount - goal.saved_amount;
          const daysLeft = goal.target_date ? differenceInDays(parseISO(goal.target_date), new Date()) : null;
          const radius = 36;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - Math.min(pct, 100) / 100);

          return (
            <div key={goal.id} className="glass-card rounded-2xl border border-border p-6 card-hover">
              <div className="flex items-start gap-4">
                {/* Circular progress */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r={radius} fill="none"
                      stroke="oklch(1 0 0 / 8%)" strokeWidth="8" />
                    <circle cx="44" cy="44" r={radius} fill="none"
                      stroke={pct >= 100 ? 'oklch(0.6 0.18 145)' : 'oklch(0.58 0.22 293)'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">{pct.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saved</span>
                      <span className="font-semibold text-savings">{formatCurrency(goal.saved_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-expense">{formatCurrency(Math.max(0, remaining))}</span>
                    </div>
                  </div>

                  {goal.target_date && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {daysLeft !== null && daysLeft > 0
                        ? `${daysLeft} days left (${formatDate(goal.target_date)})`
                        : 'Target date passed'}
                    </div>
                  )}

                  <Button size="sm" variant="outline" className="mt-3 gap-1 h-7 text-xs"
                    onClick={() => setContribGoal(goal)}>
                    <PlusCircle className="w-3 h-3" /> Add Contribution
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 glass-card rounded-2xl border border-border p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No savings goals yet. Set your first goal!</p>
          </div>
        )}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Goal Name</Label>
              <Input placeholder="e.g. New Laptop" className="bg-muted/50"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target Amount (RM)</Label>
              <Input type="number" placeholder="3000.00" className="bg-muted/50"
                value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target Date (optional)</Label>
              <Input type="date" className="bg-muted/50"
                value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog open={!!contribGoal} onOpenChange={() => setContribGoal(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Add Contribution to {contribGoal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Amount (RM)</Label>
              <Input type="number" placeholder="100.00" className="bg-muted/50"
                value={contribAmount} onChange={e => setContribAmount(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setContribGoal(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleContribute} className="flex-1 text-white"
                style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.65 0.18 175))' }}>
                Add Contribution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
