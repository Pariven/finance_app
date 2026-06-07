'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ArrowUpDown, TrendingUp, TrendingDown,
  PieChart, Target, RefreshCcw, BarChart3, FileText,
  Heart, Sparkles, Camera, LogOut, TrendingUpIcon
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Money',
    items: [
      { href: '/transactions', label: 'Transactions', icon: ArrowUpDown },
      { href: '/income', label: 'Income', icon: TrendingUp },
      { href: '/expenses', label: 'Expenses', icon: TrendingDown },
    ],
  },
  {
    label: 'Planning',
    items: [
      { href: '/budgets', label: 'Budgets', icon: PieChart },
      { href: '/goals', label: 'Savings Goals', icon: Target },
      { href: '/recurring', label: 'Recurring Bills', icon: RefreshCcw },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/reports', label: 'Reports', icon: FileText },
      { href: '/health-score', label: 'Health Score', icon: Heart },
      { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/receipt-scanner', label: 'Receipt Scanner', icon: Camera },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    toast.success('Logged out');
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 h-full flex flex-col border-r border-border flex-shrink-0"
      style={{ background: 'var(--sidebar)' }}>

      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
            <TrendingUpIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm gradient-text">FinancePro</span>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'text-white glow-purple'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, oklch(0.58 0.22 293 / 80%), oklch(0.65 0.2 220 / 60%))',
                      } : undefined}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : '')} />
                      {item.label}
                      {item.label === 'AI Insights' && (
                        <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
