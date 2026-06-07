'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinanceStore } from '@/store/useFinanceStore';
import { generateInsights } from '@/lib/ai-insights';
import { Insight } from '@/types';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

function InsightCard({ insight }: { insight: Insight }) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    alert: AlertTriangle,
  };
  const Icon = icons[insight.severity];

  const colors = {
    info: { bg: 'from-sky-500/10 to-transparent', border: 'border-sky-500/20', icon: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400' },
    warning: { bg: 'from-amber-500/10 to-transparent', border: 'border-amber-500/20', icon: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400' },
    success: { bg: 'from-emerald-500/10 to-transparent', border: 'border-emerald-500/20', icon: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400' },
    alert: { bg: 'from-rose-500/10 to-transparent', border: 'border-rose-500/20', icon: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400' },
  };

  const c = colors[insight.severity];

  return (
    <div className={cn('glass-card rounded-2xl border p-5 bg-gradient-to-br card-hover', c.bg, c.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', `${c.badge} opacity-80`)}>
          <Icon className={cn('w-4 h-4', c.icon)} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm">{insight.title}</h3>
            <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex-shrink-0', c.badge)}>
              {insight.severity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
          {insight.savings && (
            <div className="mt-3 flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">
                Potential savings: {formatCurrency(insight.savings)}/month
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AiInsightsPage() {
  useTransactions();
  const { transactions } = useFinanceStore();

  const insights = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth() + 1; const cy = now.getFullYear();
    const pm = cm === 1 ? 12 : cm - 1; const py = cm === 1 ? cy - 1 : cy;

    const current = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() + 1 === cm && d.getFullYear() === cy; });
    const previous = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() + 1 === pm && d.getFullYear() === py; });

    return generateInsights(current, previous);
  }, [transactions]);

  const severityCounts = useMemo(() => ({
    alert: insights.filter(i => i.severity === 'alert').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    success: insights.filter(i => i.severity === 'success').length,
    info: insights.filter(i => i.severity === 'info').length,
  }), [insights]);

  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> AI Insights
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Smart financial recommendations powered by your spending data
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {severityCounts.alert > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" /> {severityCounts.alert} Alert{severityCounts.alert !== 1 ? 's' : ''}
          </div>
        )}
        {severityCounts.warning > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" /> {severityCounts.warning} Warning{severityCounts.warning !== 1 ? 's' : ''}
          </div>
        )}
        {severityCounts.success > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> {severityCounts.success} Good news
          </div>
        )}
        {severityCounts.info > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium">
            <Info className="w-3 h-3" /> {severityCounts.info} Insight{severityCounts.info !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Insights grid */}
      <div className="space-y-4">
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {insights.length === 0 && (
          <div className="glass-card rounded-2xl border border-border p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Add more transactions to generate personalized insights.</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          <span className="text-primary font-medium">FinancePro AI</span> — Insights generated from your spending patterns.
          For professional financial advice, consult a certified financial advisor.
        </p>
      </div>
    </div>
  );
}
