'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useFinanceStore';
import { RecurringExpense } from '@/types';
import { toast } from 'sonner';

const DEMO_USER_ID = 'demo-user';

const DEMO_RECURRING: RecurringExpense[] = [
  { id: 'r1', user_id: DEMO_USER_ID, name: 'Netflix', amount: 55, category: 'Entertainment', due_day: 1, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'r2', user_id: DEMO_USER_ID, name: 'Spotify', amount: 16, category: 'Entertainment', due_day: 5, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'r3', user_id: DEMO_USER_ID, name: 'Unifi Internet', amount: 89, category: 'Internet', due_day: 10, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'r4', user_id: DEMO_USER_ID, name: 'Electric Bill', amount: 120, category: 'Utilities', due_day: 15, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'r5', user_id: DEMO_USER_ID, name: 'Water Bill', amount: 35, category: 'Utilities', due_day: 20, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'r6', user_id: DEMO_USER_ID, name: 'Insurance Premium', amount: 180, category: 'Insurance', due_day: 25, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

function generateLocalId() {
  return 'local-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useRecurring() {
  const { setRecurring, addRecurring, updateRecurring, deleteRecurring } = useFinanceStore();
  const qc = useQueryClient();

  const fetchRecurring = useCallback(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      setRecurring(DEMO_RECURRING);
      return DEMO_RECURRING;
    }
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRecurring(DEMO_RECURRING); return DEMO_RECURRING; }

    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('due_day', { ascending: true });

    if (error) throw error;
    const items = (data || []) as RecurringExpense[];
    setRecurring(items);
    return items;
  }, [setRecurring]);

  const query = useQuery({ queryKey: ['recurring'], queryFn: fetchRecurring });

  const createMutation = useMutation({
    mutationFn: async (input: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at'>) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        const newItem: RecurringExpense = { ...input, id: generateLocalId(), user_id: DEMO_USER_ID, created_at: new Date().toISOString() };
        addRecurring(newItem);
        return newItem;
      }
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('recurring_expenses').insert({ ...input, user_id: user?.id }).select().single();
      if (error) throw error;
      addRecurring(data as RecurringExpense);
      return data;
    },
    onSuccess: () => { toast.success('Recurring expense added!'); qc.invalidateQueries({ queryKey: ['recurring'] }); },
    onError: () => toast.error('Failed to add recurring expense'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { updateRecurring(id, { is_active }); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('recurring_expenses').update({ is_active }).eq('id', id);
      if (error) throw error;
      updateRecurring(id, { is_active });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { deleteRecurring(id); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
      if (error) throw error;
      deleteRecurring(id);
    },
    onSuccess: () => { toast.success('Recurring expense removed'); qc.invalidateQueries({ queryKey: ['recurring'] }); },
    onError: () => toast.error('Failed to remove'),
  });

  return {
    ...query,
    createRecurring: createMutation.mutate,
    toggleRecurring: toggleMutation.mutate,
    deleteRecurring: removeMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
