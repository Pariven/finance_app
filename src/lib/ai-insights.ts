import { Transaction, Insight, CategoryData } from '@/types';
import { sumBy } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

function groupByCategory(transactions: Transaction[]): Record<string, number> {
  const groups: Record<string, number> = {};
  transactions.forEach(t => {
    groups[t.category] = (groups[t.category] || 0) + t.amount;
  });
  return groups;
}

export function generateInsights(
  currentMonthTransactions: Transaction[],
  previousMonthTransactions: Transaction[]
): Insight[] {
  const insights: Insight[] = [];
  let idCounter = 0;

  const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
  const previousExpenses = previousMonthTransactions.filter(t => t.type === 'expense');
  const currentIncome = currentMonthTransactions.filter(t => t.type === 'income');
  const previousIncome = previousMonthTransactions.filter(t => t.type === 'income');

  const currentTotal = sumBy(currentExpenses, 'amount');
  const previousTotal = sumBy(previousExpenses, 'amount');
  const currentIncomeTotal = sumBy(currentIncome, 'amount');
  const previousIncomeTotal = sumBy(previousIncome, 'amount');

  const currentByCategory = groupByCategory(currentExpenses);
  const previousByCategory = groupByCategory(previousExpenses);

  // 1. Overall spending change
  if (previousTotal > 0) {
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
    if (Math.abs(change) > 10) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: change > 0 ? 'spending_spike' : 'positive_trend',
        severity: change > 30 ? 'alert' : change > 0 ? 'warning' : 'success',
        title: change > 0 ? 'Spending Increased' : 'Spending Decreased',
        message: `Your total spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}% compared to last month.`,
      });
    }
  }

  // 2. Category spikes
  Object.entries(currentByCategory).forEach(([category, amount]) => {
    const prev = previousByCategory[category] || 0;
    if (prev > 0) {
      const change = ((amount - prev) / prev) * 100;
      if (change > 35) {
        insights.push({
          id: `insight-${idCounter++}`,
          type: 'spending_spike',
          severity: 'warning',
          title: `${category} Spending Spike`,
          message: `You spent ${change.toFixed(0)}% more on ${category} this month (${formatCurrency(amount)} vs ${formatCurrency(prev)}).`,
          category,
        });
      }
    }
  });

  // 3. Top spending category
  const sortedCategories = Object.entries(currentByCategory).sort(([, a], [, b]) => b - a);
  if (sortedCategories.length > 0 && currentTotal > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const pct = ((topAmount / currentTotal) * 100).toFixed(0);
    insights.push({
      id: `insight-${idCounter++}`,
      type: 'pattern',
      severity: 'info',
      title: 'Top Spending Category',
      message: `${topCat} is your biggest expense this month, accounting for ${pct}% of total spending (${formatCurrency(topAmount)}).`,
      category: topCat,
    });
  }

  // 4. Savings rate
  if (currentIncomeTotal > 0) {
    const savingsRate = ((currentIncomeTotal - currentTotal) / currentIncomeTotal) * 100;
    if (savingsRate >= 20) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'savings_improvement',
        severity: 'success',
        title: 'Great Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(0)}% of your income this month. Keep it up!`,
      });
    } else if (savingsRate < 5 && currentIncomeTotal > 0) {
      const potential = currentIncomeTotal * 0.2 - (currentIncomeTotal - currentTotal);
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'recommendation',
        severity: 'alert',
        title: 'Low Savings Rate',
        message: `You're saving only ${savingsRate.toFixed(0)}% of your income. Aim for at least 20% to build financial resilience.`,
        savings: potential > 0 ? potential : undefined,
      });
    }
  }

  // 5. Income improvement
  if (previousIncomeTotal > 0) {
    const change = ((currentIncomeTotal - previousIncomeTotal) / previousIncomeTotal) * 100;
    if (change > 5) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'savings_improvement',
        severity: 'success',
        title: 'Income Improved',
        message: `Your income increased by ${change.toFixed(0)}% this month. Consider allocating the extra ${formatCurrency(currentIncomeTotal - previousIncomeTotal)} to savings or investments.`,
      });
    }
  }

  // 6. Dining Out recommendation
  const diningOut = currentByCategory['Dining Out'] || 0;
  if (diningOut > 300) {
    const potential = diningOut * 0.3;
    insights.push({
      id: `insight-${idCounter++}`,
      type: 'recommendation',
      severity: 'info',
      title: 'Reduce Dining Out',
      message: `You spent ${formatCurrency(diningOut)} on dining out this month. Cooking at home more often could save up to ${formatCurrency(potential)} monthly.`,
      category: 'Dining Out',
      savings: potential,
    });
  }

  // 7. No income warning
  if (currentIncome.length === 0) {
    insights.push({
      id: `insight-${idCounter++}`,
      type: 'recommendation',
      severity: 'alert',
      title: 'No Income Recorded',
      message: 'No income has been recorded this month. Make sure to log all income sources for accurate financial tracking.',
    });
  }

  return insights.slice(0, 8); // Max 8 insights
}

export function getCategoryColors(): Record<string, string> {
  return {
    'Food & Drinks': '#f59e0b',
    'Groceries': '#10b981',
    'Transport': '#6366f1',
    'Fuel': '#8b5cf6',
    'Rent': '#ef4444',
    'Utilities': '#3b82f6',
    'Internet': '#06b6d4',
    'Healthcare': '#ec4899',
    'Insurance': '#84cc16',
    'Shopping': '#f97316',
    'Entertainment': '#a855f7',
    'Travel': '#14b8a6',
    'Dining Out': '#f43f5e',
    'Education': '#0ea5e9',
    'Savings': '#22c55e',
    'Investments': '#7c3aed',
    'Salary': '#10b981',
    'Freelance': '#6366f1',
    'Business': '#f59e0b',
    'Rental': '#3b82f6',
    'Dividends': '#8b5cf6',
    'Other Income': '#94a3b8',
  };
}

export function buildCategoryData(transactions: Transaction[]): CategoryData[] {
  const colors = getCategoryColors();
  const byCategory = groupByCategory(transactions.filter(t => t.type === 'expense'));
  const total = Object.values(byCategory).reduce((s, a) => s + a, 0);
  return Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: colors[category] || '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount);
}
