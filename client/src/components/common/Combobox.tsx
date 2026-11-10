import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { Button } from '../ui/button.js';
import { cn } from '../../lib/utils.js';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal text-left', className)}
        >
          <span className={cn('truncate', !selectedLabel && 'text-slate-400')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-48 overflow-y-auto pt-1">
          {filteredOptions.length === 0 ? (
            <p className="p-2 text-center text-xs text-slate-400">No matching option found.</p>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex w-full items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs transition-colors cursor-pointer text-left',
                  value === opt.value
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700',
                )}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="h-3.5 w-3.5 text-primary-600" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
