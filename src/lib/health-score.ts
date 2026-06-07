import { Transaction, Budget, BudgetWithSpending, HealthScore, HealthScoreFactor } from '@/types';
import { sumBy } from '@/lib/utils';

const SCORE_LEVELS = {
  excellent: { min: 90, label: 'Excellent', color: '#10b981' },
  good: { min: 75, label: 'Good', color: '#6366f1' },
  average: { min: 50, label: 'Average', color: '#f59e0b' },
  poor: { min: 0, label: 'Needs Improvement', color: '#ef4444' },
} as const;

function getLevel(score: number): HealthScore['level'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

function getFactorStatus(score: number): HealthScoreFactor['status'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

// Savings Rate: income vs expenses
function calcSavingsRate(income: number, expenses: number): HealthScoreFactor {
  const rate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  // 20%+ = excellent, 10-20% = good, 0-10% = average, negative = poor
  let score = 0;
  if (rate >= 30) score = 100;
  else if (rate >= 20) score = 85;
  else if (rate >= 10) score = 65;
  else if (rate >= 0) score = 40;
  else score = 10;

  return {
    name: 'Savings Rate',
    score,
    weight: 30,
    status: getFactorStatus(score),
    description: `${rate.toFixed(1)}% of income saved`,
  };
}

// Budget Adherence: how well budgets are kept
function calcBudgetAdherence(budgets: BudgetWithSpending[]): HealthScoreFactor {
  if (budgets.length === 0) {
    return {
      name: 'Budget Adherence',
      score: 60,
      weight: 25,
      status: 'average',
      description: 'No budgets set',
    };
  }
  const compliant = budgets.filter(b => b.percentage <= 100).length;
  const rate = (compliant / budgets.length) * 100;
  const score = rate >= 90 ? 95 : rate >= 70 ? 75 : rate >= 50 ? 55 : 30;
  return {
    name: 'Budget Adherence',
    score,
    weight: 25,
    status: getFactorStatus(score),
    description: `${compliant}/${budgets.length} budgets on track`,
  };
}

// Income Stability: consistent income sources
function calcIncomeStability(transactions: Transaction[]): HealthScoreFactor {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const uniqueSources = new Set(incomeTransactions.map(t => t.category)).size;
  const score = uniqueSources >= 3 ? 95 : uniqueSources === 2 ? 80 : uniqueSources === 1 ? 60 : 20;
  return {
    name: 'Income Stability',
    score,
    weight: 20,
    status: getFactorStatus(score),
    description: `${uniqueSources} income source${uniqueSources !== 1 ? 's' : ''}`,
  };
}

// Spending Behavior: expense distribution quality
function calcSpendingBehavior(transactions: Transaction[]): HealthScoreFactor {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    return { name: 'Spending Behavior', score: 70, weight: 15, status: 'good', description: 'No expenses recorded' };
  }
  const total = sumBy(expenses, 'amount');
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const categories = Object.values(byCategory);
  const maxShare = total > 0 ? Math.max(...categories) / total : 1;
  // If no single category >50% = excellent distribution
  const score = maxShare < 0.3 ? 95 : maxShare < 0.5 ? 75 : maxShare < 0.7 ? 55 : 30;
  return {
    name: 'Spending Behavior',
    score,
    weight: 15,
    status: getFactorStatus(score),
    description: `Spending across ${categories.length} categories`,
  };
}

// Debt Ratio (simplified): large single expenses relative to income
function calcDebtRatio(income: number, expenses: number): HealthScoreFactor {
  const ratio = income > 0 ? expenses / income : 1;
  const score = ratio < 0.5 ? 95 : ratio < 0.7 ? 80 : ratio < 0.9 ? 55 : ratio <= 1 ? 35 : 10;
  return {
    name: 'Debt Ratio',
    score,
    weight: 10,
    status: getFactorStatus(score),
    description: `${(ratio * 100).toFixed(0)}% expense-to-income ratio`,
  };
}

export function calculateHealthScore(
  transactions: Transaction[],
  budgets: BudgetWithSpending[]
): HealthScore {
  const income = sumBy(transactions.filter(t => t.type === 'income'), 'amount');
  const expenses = sumBy(transactions.filter(t => t.type === 'expense'), 'amount');

  const factors: HealthScoreFactor[] = [
    calcSavingsRate(income, expenses),
    calcBudgetAdherence(budgets),
    calcIncomeStability(transactions),
    calcSpendingBehavior(transactions),
    calcDebtRatio(income, expenses),
  ];

  const total = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  return {
    total,
    level: getLevel(total),
    factors,
  };
}

export { SCORE_LEVELS };
