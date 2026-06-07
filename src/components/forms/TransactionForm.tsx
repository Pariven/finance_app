'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, TransactionType } from '@/types';
import { getCurrentDateString } from '@/lib/formatters';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useEffect } from 'react';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Rental', 'Dividends', 'Other Income'];
const EXPENSE_CATEGORIES = [
  'Food & Drinks', 'Groceries', 'Transport', 'Fuel', 'Rent', 'Utilities', 'Internet',
  'Healthcare', 'Insurance', 'Shopping', 'Entertainment', 'Travel', 'Dining Out',
  'Education', 'Savings', 'Investments',
];

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine(v => parseFloat(v) > 0, 'Amount must be positive'),
  category: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  date: z.string().min(1, 'Select a date'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  initialData?: Partial<Transaction>;
  defaultType?: TransactionType;
  isLoading?: boolean;
}

export default function TransactionForm({
  open, onClose, onSubmit, initialData, defaultType = 'expense', isLoading
}: TransactionFormProps) {
  const { selectedDate } = useFinanceStore();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      date: selectedDate || getCurrentDateString(),
      amount: '',
      category: '',
      description: '',
    },
  });

  const type = watch('type');
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type || defaultType,
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date || selectedDate || getCurrentDateString(),
      });
    } else {
      reset({ type: defaultType, date: selectedDate || getCurrentDateString(), amount: '', category: '', description: '' });
    }
  }, [initialData, defaultType, reset, open, selectedDate]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description || '',
      date: data.date,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setValue('type', t); setValue('category', ''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="txn-amount">Amount (RM)</Label>
            <Input id="txn-amount" type="number" step="0.01" placeholder="0.00"
              className="bg-muted/50" {...register('amount')} />
            {errors.amount && <p className="text-xs text-expense">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={watch('category')} onValueChange={(v) => setValue('category', v ?? '')}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-expense">{errors.category.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="txn-date">Date</Label>
            <Input id="txn-date" type="date" className="bg-muted/50" {...register('date')} />
            {errors.date && <p className="text-xs text-expense">{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="txn-desc">Description (optional)</Label>
            <Textarea id="txn-desc" placeholder="What was this for?" rows={2}
              className="bg-muted/50 resize-none" {...register('description')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 text-white"
              style={{ background: type === 'income'
                ? 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.65 0.18 175))'
                : 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
