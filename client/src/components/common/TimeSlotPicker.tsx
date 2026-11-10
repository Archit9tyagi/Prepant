import React from 'react';
import { cn } from '../../lib/utils.js';

export interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected?: string;
  onSelectSlot?: (time: string) => void;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selected,
  onSelectSlot,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-2', className)}>
      {slots.map((slot) => {
        const isSelected = selected === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => slot.available && onSelectSlot?.(slot.time)}
            className={cn(
              'py-2.5 px-3 rounded-[10px] text-xs font-semibold text-center transition-all cursor-pointer border',
              isSelected && 'bg-primary-600 text-white border-primary-600 shadow-xs',
              !isSelected &&
                slot.available &&
                'bg-white text-slate-800 border-slate-200 hover:border-primary-500 hover:bg-primary-50/50',
              !slot.available &&
                'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through',
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
};
