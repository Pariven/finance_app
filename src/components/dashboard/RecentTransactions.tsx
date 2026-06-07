'use client';

import { useMemo } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCategoryColors } from '@/lib/ai-insights';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const colors = getCategoryColors();
  const recent = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10),
    [transactions]
  );

  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest 10 transactions</p>
        </div>
        <Link href="/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {recent.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No transactions yet. Add your first transaction!
          </div>
        )}
        {recent.map((txn) => {
          const catColor = colors[txn.category] || '#94a3b8';
          return (
            <div key={txn.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors group">
              {/* Category dot */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${catColor}20` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: catColor }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {txn.description || txn.category}
                </p>
                <p className="text-xs text-muted-foreground">
                  {txn.category} · {formatDate(txn.date)}
                </p>
              </div>

              {/* Badge */}
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-medium border-0',
                  txn.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                )}>
                {txn.type === 'income' ? 'Income' : 'Expense'}
              </Badge>

              {/* Amount */}
              <span className={cn(
                'text-sm font-bold font-mono flex-shrink-0',
                txn.type === 'income' ? 'text-income' : 'text-expense'
              )}>
                {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
