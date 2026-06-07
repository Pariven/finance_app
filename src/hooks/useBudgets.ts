'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Budget } from '@/types';
import { toast } from 'sonner';

const DEMO_USER_ID = 'demo-user';

const DEMO_BUDGETS: Budget[] = [
  { id: 'b1', user_id: DEMO_USER_ID, category: 'Groceries', limit_amount: 400, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
  { id: 'b2', user_id: DEMO_USER_ID, category: 'Dining Out', limit_amount: 300, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
  { id: 'b3', user_id: DEMO_USER_ID, category: 'Transport', limit_amount: 200, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
  { id: 'b4', user_id: DEMO_USER_ID, category: 'Shopping', limit_amount: 250, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
  { id: 'b5', user_id: DEMO_USER_ID, category: 'Entertainment', limit_amount: 100, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
  { id: 'b6', user_id: DEMO_USER_ID, category: 'Utilities', limit_amount: 250, month: 6, year: 2026, created_at: '2026-06-01T00:00:00Z' },
];

function generateLocalId() {
  return 'local-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useBudgets() {
  const { setBudgets, addBudget, updateBudget, deleteBudget } = useFinanceStore();
  const qc = useQueryClient();

  const fetchBudgets = useCallback(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      setBudgets(DEMO_BUDGETS);
      return DEMO_BUDGETS;
    }
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBudgets(DEMO_BUDGETS); return DEMO_BUDGETS; }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const budgets = (data || []) as Budget[];
    setBudgets(budgets);
    return budgets;
  }, [setBudgets]);

  const query = useQuery({ queryKey: ['budgets'], queryFn: fetchBudgets });

  const createMutation = useMutation({
    mutationFn: async (input: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        const newBudget: Budget = { ...input, id: generateLocalId(), user_id: DEMO_USER_ID, created_at: new Date().toISOString() };
        addBudget(newBudget);
        return newBudget;
      }
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('budgets').insert({ ...input, user_id: user?.id }).select().single();
      if (error) throw error;
      addBudget(data as Budget);
      return data;
    },
    onSuccess: () => { toast.success('Budget created!'); qc.invalidateQueries({ queryKey: ['budgets'] }); },
    onError: () => toast.error('Failed to create budget'),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Budget> }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { updateBudget(id, data); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('budgets').update(data).eq('id', id);
      if (error) throw error;
      updateBudget(id, data);
    },
    onSuccess: () => { toast.success('Budget updated!'); qc.invalidateQueries({ queryKey: ['budgets'] }); },
    onError: () => toast.error('Failed to update budget'),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { deleteBudget(id); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      deleteBudget(id);
    },
    onSuccess: () => { toast.success('Budget deleted'); qc.invalidateQueries({ queryKey: ['budgets'] }); },
    onError: () => toast.error('Failed to delete budget'),
  });

  return {
    ...query,
    createBudget: createMutation.mutate,
    updateBudget: editMutation.mutate,
    deleteBudget: removeMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
