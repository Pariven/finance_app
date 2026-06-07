'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types';
import { getCurrentDateString } from '@/lib/formatters';
import { toast } from 'sonner';

function generateLocalId() {
  return 'local-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Local demo data for when Supabase is not configured
const DEMO_USER_ID = 'demo-user';

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', user_id: DEMO_USER_ID, type: 'income', amount: 4000, category: 'Salary', description: 'Monthly salary', date: '2026-06-01', created_at: '2026-06-01T09:00:00Z' },
  { id: '2', user_id: DEMO_USER_ID, type: 'income', amount: 800, category: 'Freelance', description: 'Web project payment', date: '2026-06-05', created_at: '2026-06-05T10:00:00Z' },
  { id: '3', user_id: DEMO_USER_ID, type: 'expense', amount: 1200, category: 'Rent', description: 'Monthly rent', date: '2026-06-01', created_at: '2026-06-01T09:00:00Z' },
  { id: '4', user_id: DEMO_USER_ID, type: 'expense', amount: 250, category: 'Groceries', description: 'Weekly groceries', date: '2026-06-03', created_at: '2026-06-03T14:00:00Z' },
  { id: '5', user_id: DEMO_USER_ID, type: 'expense', amount: 150, category: 'Transport', description: 'Grab & MRT', date: '2026-06-04', created_at: '2026-06-04T08:00:00Z' },
  { id: '6', user_id: DEMO_USER_ID, type: 'expense', amount: 320, category: 'Dining Out', description: 'Restaurants & cafes', date: '2026-06-05', created_at: '2026-06-05T12:00:00Z' },
  { id: '7', user_id: DEMO_USER_ID, type: 'expense', amount: 89, category: 'Internet', description: 'Unifi monthly', date: '2026-06-02', created_at: '2026-06-02T09:00:00Z' },
  { id: '8', user_id: DEMO_USER_ID, type: 'expense', amount: 55, category: 'Entertainment', description: 'Netflix + Spotify', date: '2026-06-01', created_at: '2026-06-01T09:00:00Z' },
  { id: '9', user_id: DEMO_USER_ID, type: 'expense', amount: 180, category: 'Shopping', description: 'Clothing & accessories', date: '2026-06-06', created_at: '2026-06-06T15:00:00Z' },
  { id: '10', user_id: DEMO_USER_ID, type: 'expense', amount: 200, category: 'Utilities', description: 'Electric & water bills', date: '2026-06-07', created_at: '2026-06-07T09:00:00Z' },
  { id: '11', user_id: DEMO_USER_ID, type: 'income', amount: 4000, category: 'Salary', description: 'Monthly salary', date: '2026-05-01', created_at: '2026-05-01T09:00:00Z' },
  { id: '12', user_id: DEMO_USER_ID, type: 'expense', amount: 1200, category: 'Rent', description: 'Monthly rent', date: '2026-05-01', created_at: '2026-05-01T09:00:00Z' },
  { id: '13', user_id: DEMO_USER_ID, type: 'expense', amount: 220, category: 'Groceries', description: 'Weekly groceries', date: '2026-05-10', created_at: '2026-05-10T14:00:00Z' },
  { id: '14', user_id: DEMO_USER_ID, type: 'expense', amount: 130, category: 'Transport', description: 'Transport', date: '2026-05-15', created_at: '2026-05-15T08:00:00Z' },
  { id: '15', user_id: DEMO_USER_ID, type: 'expense', amount: 200, category: 'Dining Out', description: 'Dining', date: '2026-05-20', created_at: '2026-05-20T12:00:00Z' },
];

export function useTransactions() {
  const { setTransactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const qc = useQueryClient();

  const fetchTransactions = useCallback(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      // Demo mode
      setTransactions(DEMO_TRANSACTIONS);
      return DEMO_TRANSACTIONS;
    }
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTransactions(DEMO_TRANSACTIONS); return DEMO_TRANSACTIONS; }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    const txns = (data || []) as Transaction[];
    setTransactions(txns);
    return txns;
  }, [setTransactions]);

  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const createMutation = useMutation({
    mutationFn: async (input: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        const newTxn: Transaction = {
          ...input,
          id: generateLocalId(),
          user_id: DEMO_USER_ID,
          created_at: new Date().toISOString(),
        };
        addTransaction(newTxn);
        return newTxn;
      }
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('transactions').insert({
        ...input, user_id: user?.id,
      }).select().single();
      if (error) throw error;
      addTransaction(data as Transaction);
      return data;
    },
    onSuccess: () => {
      toast.success('Transaction added!');
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => toast.error('Failed to add transaction'),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        updateTransaction(id, data);
        return;
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('transactions').update(data).eq('id', id);
      if (error) throw error;
      updateTransaction(id, data);
    },
    onSuccess: () => {
      toast.success('Transaction updated!');
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => toast.error('Failed to update transaction'),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        deleteTransaction(id);
        return;
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      deleteTransaction(id);
    },
    onSuccess: () => {
      toast.success('Transaction deleted');
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => toast.error('Failed to delete transaction'),
  });

  return {
    ...query,
    createTransaction: createMutation.mutate,
    updateTransaction: editMutation.mutate,
    deleteTransaction: removeMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: editMutation.isPending,
    isDeleting: removeMutation.isPending,
  };
}
