import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selected || new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day && selected.getMonth() === month && selected.getFullYear() === year
    );
  };

  return (
    <div
      className={cn(
        'p-3 bg-white rounded-[16px] border border-slate-200 w-full max-w-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <h4 className="text-sm font-bold text-slate-900">{monthName}</h4>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8 w-8" />;
          }
          const selectedDay = isSelected(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect?.(new Date(year, month, day))}
              className={cn(
                'h-8 w-8 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-center mx-auto',
                selectedDay
                  ? 'bg-primary-600 text-white font-bold'
                  : 'hover:bg-slate-100 text-slate-700',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
