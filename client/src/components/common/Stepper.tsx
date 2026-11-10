import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('w-full py-4', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                    isCompleted && 'bg-emerald-500 text-white',
                    isActive && 'bg-primary-600 text-white ring-4 ring-primary-100',
                    !isCompleted && !isActive && 'bg-slate-100 text-slate-400',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-semibold text-center hidden sm:block max-w-[80px]',
                    isActive && 'text-primary-700',
                    isCompleted && 'text-slate-800',
                    !isCompleted && !isActive && 'text-slate-400',
                  )}
                >
                  {step}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] flex-1 mx-2 transition-colors',
                    stepNumber < currentStep ? 'bg-emerald-500' : 'bg-slate-200',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
