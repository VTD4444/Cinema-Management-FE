import React from 'react';
import { cn } from '../../utils/mergeClass';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(
    ({ className, label, error, helperText, children, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
                <div className="relative">
                    <select
                        className={cn(
                            'flex h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-10 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus-visible:ring-red-500',
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
                {error && <span className="text-xs text-red-500">{error}</span>}
                {!error && helperText && <span className="text-xs text-gray-400">{helperText}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
