'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number | null;
    indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, indicatorClassName, ...props }, ref) => (
        <div
            ref={ref}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value ?? 0}
            className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
            {...props}
        >
            <div
                className={cn(
                    'h-full bg-primary transition-all duration-300',
                    indicatorClassName
                )}
                style={{ width: `${Math.min(value || 0, 100)}%` }}
            />
        </div>
    )
);
Progress.displayName = 'Progress';

export { Progress };
