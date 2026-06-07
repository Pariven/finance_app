'use client';

import { Bell, Search, Calendar, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from '@/components/layout/Sidebar';
import { useFinanceStore } from '@/store/useFinanceStore';




export default function TopNav() {
  const { profile, selectedDate, setSelectedDate } = useFinanceStore();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 gap-4 flex-shrink-0"
      style={{ background: 'oklch(0.11 0.015 264 / 80%)', backdropFilter: 'blur(8px)' }}>

      {/* Left: Mobile Menu & Date */}
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-border" showCloseButton={false}>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:flex items-center gap-2 ml-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{today}</span>
        </div>
      </div>

      {/* Center: Date selector */}
      <div className="flex items-center gap-2 relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-10 pl-10 pr-3 rounded-xl text-sm font-medium bg-muted/30 border border-border/50 text-foreground outline-none transition-all hover:bg-muted/50 focus:bg-muted/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:block text-foreground">
            {profile?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
