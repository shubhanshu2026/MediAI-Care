import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500',
                  // Completed: Green background with Check icon
                  isCompleted && 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
                  // Active: Primary Blue background with Glow
                  isActive && 'border-white bg-white text-primary shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110',
                  // Upcoming: Faded border
                  !isCompleted && !isActive && 'border-white/20 bg-white/10 text-white/40'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  'absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300',
                  isActive ? 'text-white' : isCompleted ? 'text-white/90' : 'text-white/40'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connecting Line */}
            {i < steps.length - 1 && (
              <div className="mx-4 h-[2px] flex-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    'h-full bg-emerald-400 transition-all duration-700 ease-in-out',
                    stepNum < currentStep ? 'w-full' : 'w-0'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}