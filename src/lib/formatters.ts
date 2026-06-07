import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Currency formatting — Malaysian Ringgit
export function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) return `RM ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `RM ${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

// Date formatting
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'dd/MM/yy');
  } catch {
    return dateString;
  }
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return format(date, 'MMMM yyyy');
}

export function formatMonthShort(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return format(date, 'MMM');
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return formatDate(dateString);
  } catch {
    return '';
  }
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getCurrentDateString(): string {
  return toISODateString(new Date());
}

export function getMonthDateRange(month: number, year: number): { start: string; end: string } {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return { start: toISODateString(start), end: toISODateString(end) };
}

export function getDaysInMonthArray(month: number, year: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return eachDayOfInterval({ start, end });
}

export function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}
