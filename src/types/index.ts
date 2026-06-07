// ============================================================
// Core TypeScript Types for Personal Finance Dashboard Pro
// ============================================================

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Rental'
  | 'Dividends'
  | 'Other Income';

export type ExpenseCategory =
  // Essential
  | 'Food & Drinks'
  | 'Groceries'
  | 'Transport'
  | 'Fuel'
  | 'Rent'
  | 'Utilities'
  | 'Internet'
  | 'Healthcare'
  | 'Insurance'
  // Lifestyle
  | 'Shopping'
  | 'Entertainment'
  | 'Travel'
  | 'Dining Out'
  // Growth & Wealth
  | 'Education'
  | 'Savings'
  | 'Investments'
  // Custom
  | string;

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string; // ISO date string
  receipt_url?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  limit_amount: number;
  month: number; // 1-12
  year: number;
  created_at: string;
}

export interface BudgetWithSpending extends Budget {
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string;
  created_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  due_day: number; // 1-31
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email?: string;
  currency: string;
  created_at: string;
}

// ============================================================
// Financial Health Score
// ============================================================

export interface HealthScoreFactor {
  name: string;
  score: number; // 0-100
  weight: number; // percentage weight
  status: 'excellent' | 'good' | 'average' | 'poor';
  description: string;
}

export interface HealthScore {
  total: number; // 0-100
  level: 'excellent' | 'good' | 'average' | 'poor';
  factors: HealthScoreFactor[];
}

// ============================================================
// AI Insights
// ============================================================

export type InsightType =
  | 'spending_spike'
  | 'savings_improvement'
  | 'budget_warning'
  | 'positive_trend'
  | 'recommendation'
  | 'pattern';

export type InsightSeverity = 'info' | 'warning' | 'success' | 'alert';

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  category?: string;
  savings?: number; // potential savings in RM
}

// ============================================================
// Analytics / Chart Data
// ============================================================

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailySpending {
  date: string;
  amount: number;
}

// ============================================================
// Receipt Scanner
// ============================================================

export interface ScannedReceipt {
  merchant: string;
  date: string;
  amount: number;
  tax?: number;
  category: TransactionCategory;
  rawText?: string;
}

// ============================================================
// Reports
// ============================================================

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReportData {
  period: ReportPeriod;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  balance: number;
  growthPercentage?: number;
  topCategories: CategoryData[];
  transactions: Transaction[];
}

// ============================================================
// Dashboard Summary
// ============================================================

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  balance: number;
  avgDailySpending: number;
  highestExpenseCategory: string;
  monthlyGrowth: number;
  savingsRate: number;
}
