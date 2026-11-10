import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.js';
import { cn } from '../../lib/utils.js';

interface TimezoneSelectProps {
  value: string;
  onChange: (tz: string) => void;
  className?: string;
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Asia/Kolkata' },
  { value: 'America/New_York', label: 'Eastern Time (ET) - America/New_York' },
  { value: 'America/Chicago', label: 'Central Time (CT) - America/Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - America/Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - America/Los_Angeles' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - Europe/London' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) - Europe/Paris' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Asia/Dubai' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT) - Asia/Singapore' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST) - Australia/Sydney' },
];

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({ value, onChange, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your time zone" />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
