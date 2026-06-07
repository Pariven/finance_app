'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types';
import { toast } from 'sonner';

const DEMO_USER_ID = 'demo-user';

const DEMO_GOALS: SavingsGoal[] = [
  { id: 'g1', user_id: DEMO_USER_ID, name: 'New Laptop', target_amount: 3000, saved_amount: 1800, target_date: '2026-09-30', created_at: '2026-01-01T00:00:00Z' },
  { id: 'g2', user_id: DEMO_USER_ID, name: 'Emergency Fund', target_amount: 10000, saved_amount: 5500, target_date: '2027-01-01', created_at: '2026-01-01T00:00:00Z' },
  { id: 'g3', user_id: DEMO_USER_ID, name: 'Japan Vacation', target_amount: 5000, saved_amount: 1200, target_date: '2026-12-31', created_at: '2026-02-01T00:00:00Z' },
  { id: 'g4', user_id: DEMO_USER_ID, name: 'Car Down Payment', target_amount: 15000, saved_amount: 4000, target_date: '2027-06-01', created_at: '2026-03-01T00:00:00Z' },
];

function generateLocalId() {
  return 'local-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useGoals() {
  const { setGoals, addGoal, updateGoal, deleteGoal } = useFinanceStore();
  const qc = useQueryClient();

  const fetchGoals = useCallback(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      setGoals(DEMO_GOALS);
      return DEMO_GOALS;
    }
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGoals(DEMO_GOALS); return DEMO_GOALS; }

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const goals = (data || []) as SavingsGoal[];
    setGoals(goals);
    return goals;
  }, [setGoals]);

  const query = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });

  const createMutation = useMutation({
    mutationFn: async (input: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        const newGoal: SavingsGoal = { ...input, id: generateLocalId(), user_id: DEMO_USER_ID, created_at: new Date().toISOString() };
        addGoal(newGoal);
        return newGoal;
      }
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('savings_goals').insert({ ...input, user_id: user?.id }).select().single();
      if (error) throw error;
      addGoal(data as SavingsGoal);
      return data;
    },
    onSuccess: () => { toast.success('Goal created!'); qc.invalidateQueries({ queryKey: ['goals'] }); },
    onError: () => toast.error('Failed to create goal'),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SavingsGoal> }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { updateGoal(id, data); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('savings_goals').update(data).eq('id', id);
      if (error) throw error;
      updateGoal(id, data);
    },
    onSuccess: () => { toast.success('Goal updated!'); qc.invalidateQueries({ queryKey: ['goals'] }); },
    onError: () => toast.error('Failed to update goal'),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') { deleteGoal(id); return; }
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
      deleteGoal(id);
    },
    onSuccess: () => { toast.success('Goal deleted'); qc.invalidateQueries({ queryKey: ['goals'] }); },
    onError: () => toast.error('Failed to delete goal'),
  });

  const addContributionMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const { goals } = useFinanceStore.getState();
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');
      const newSaved = goal.saved_amount + amount;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        updateGoal(goalId, { saved_amount: newSaved });
        return;
      }
      const supabase = getSupabaseClient();
      await supabase.from('goal_contributions').insert({ goal_id: goalId, amount, date: new Date().toISOString().split('T')[0] });
      await supabase.from('savings_goals').update({ saved_amount: newSaved }).eq('id', goalId);
      updateGoal(goalId, { saved_amount: newSaved });
    },
    onSuccess: () => { toast.success('Contribution added!'); qc.invalidateQueries({ queryKey: ['goals'] }); },
    onError: () => toast.error('Failed to add contribution'),
  });

  return {
    ...query,
    createGoal: createMutation.mutate,
    updateGoal: editMutation.mutate,
    deleteGoal: removeMutation.mutate,
    addContribution: addContributionMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
