import { create } from 'zustand';
import { Transaction, Budget, SavingsGoal, RecurringExpense, Profile } from '@/types';

interface FinanceStore {
  // User
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goals
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[]) => void;
  addGoal: (goal: SavingsGoal) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;

  // Recurring
  recurring: RecurringExpense[];
  setRecurring: (recurring: RecurringExpense[]) => void;
  addRecurring: (item: RecurringExpense) => void;
  updateRecurring: (id: string, data: Partial<RecurringExpense>) => void;
  deleteRecurring: (id: string) => void;

  // UI state
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => {
  const now = new Date();
  return {
    profile: null,
    setProfile: (profile) => set({ profile }),

    transactions: [],
    setTransactions: (transactions) => set({ transactions }),
    addTransaction: (transaction) =>
      set((state) => ({ transactions: [transaction, ...state.transactions] })),
    updateTransaction: (id, data) =>
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
      })),
    deleteTransaction: (id) =>
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      })),

    budgets: [],
    setBudgets: (budgets) => set({ budgets }),
    addBudget: (budget) =>
      set((state) => ({ budgets: [...state.budgets, budget] })),
    updateBudget: (id, data) =>
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...data } : b)),
      })),
    deleteBudget: (id) =>
      set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

    goals: [],
    setGoals: (goals) => set({ goals }),
    addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
    updateGoal: (id, data) =>
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
      })),
    deleteGoal: (id) =>
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

    recurring: [],
    setRecurring: (recurring) => set({ recurring }),
    addRecurring: (item) =>
      set((state) => ({ recurring: [...state.recurring, item] })),
    updateRecurring: (id, data) =>
      set((state) => ({
        recurring: state.recurring.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      })),
    deleteRecurring: (id) =>
      set((state) => ({ recurring: state.recurring.filter((r) => r.id !== id) })),

    selectedDate: now.toISOString().split('T')[0],
    setSelectedDate: (date) => set({ selectedDate: date }),
  };
});
