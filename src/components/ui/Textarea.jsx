import React from 'react';
import { cn } from '../../utils/mergeClass';

export const Textarea = React.forwardRef(
    ({ className, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-gray-500',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'resize-y',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <span className="text-xs text-red-500">{error}</span>}
                {!error && helperText && <span className="text-xs text-gray-400">{helperText}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
