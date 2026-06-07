'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useFinanceStore } from '@/store/useFinanceStore';
import { calculateHealthScore, SCORE_LEVELS } from '@/lib/health-score';
import { Heart, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HealthScorePage() {
  useTransactions();
  useBudgets();
  const { transactions, budgets } = useFinanceStore();

  const budgetsWithSpending = budgets.map(budget => {
    const spent = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && t.category === budget.category &&
        d.getMonth() + 1 === budget.month && d.getFullYear() === budget.year;
    }).reduce((s, t) => s + t.amount, 0);
    const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
    return { ...budget, spent, percentage, status: percentage >= 100 ? 'exceeded' as const : percentage >= 90 ? 'danger' as const : percentage >= 75 ? 'warning' as const : 'safe' as const };
  });

  const score = calculateHealthScore(transactions, budgetsWithSpending);

  const scoreColor = score.total >= 90 ? '#10b981'
    : score.total >= 75 ? '#6366f1'
    : score.total >= 50 ? '#f59e0b'
    : '#ef4444';

  const levelLabel = score.level.charAt(0).toUpperCase() + score.level.slice(1);

  const FactorIcon = ({ status }: { status: string }) => {
    if (status === 'excellent') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'good') return <Info className="w-4 h-4 text-violet-400" />;
    if (status === 'average') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-rose-400" />;
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-400" /> Financial Health Score
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          A comprehensive analysis of your financial wellbeing
        </p>
      </div>

      {/* Big Score Gauge */}
      <div className="glass-card rounded-2xl border border-border p-8 flex flex-col items-center">
        <div className="relative w-56 h-56">
          <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
            {/* Background track */}
            <circle cx="100" cy="100" r={radius} fill="none"
              stroke="oklch(1 0 0 / 8%)" strokeWidth="14" />
            {/* Score arc */}
            <circle cx="100" cy="100" r={radius} fill="none"
              stroke={scoreColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - score.total / 100)}
              style={{ transition: 'stroke-dashoffset 1.5s ease, stroke 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color: scoreColor }}>{score.total}</span>
            <span className="text-lg text-muted-foreground font-medium">/100</span>
            <span className="text-sm font-semibold mt-1" style={{ color: scoreColor }}>{levelLabel}</span>
          </div>
        </div>

        {/* Score levels legend */}
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          {[
            { range: '90-100', label: 'Excellent', color: '#10b981' },
            { range: '75-89', label: 'Good', color: '#6366f1' },
            { range: '50-74', label: 'Average', color: '#f59e0b' },
            { range: '0-49', label: 'Needs Improvement', color: '#ef4444' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-muted-foreground">{l.range}</span>
              <span className="font-medium" style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Score Breakdown</h2>
        {score.factors.map(factor => (
          <div key={factor.name} className="glass-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FactorIcon status={factor.status} />
                <div>
                  <h3 className="font-semibold text-sm">{factor.name}</h3>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{factor.score}</p>
                <p className="text-xs text-muted-foreground">Weight: {factor.weight}%</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${factor.score}%`,
                  background: factor.status === 'excellent' ? '#10b981'
                    : factor.status === 'good' ? '#6366f1'
                    : factor.status === 'average' ? '#f59e0b'
                    : '#ef4444',
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="glass-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-3">How to Improve</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Aim to save at least 20% of your monthly income.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Set monthly budgets for each spending category and stick to them.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Diversify your income sources for greater stability.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Keep expenses below 70% of your income to maintain a healthy balance.
          </li>
        </ul>
      </div>
    </div>
  );
}
