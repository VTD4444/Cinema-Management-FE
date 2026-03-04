import React from 'react';
import { cn } from '../../utils/mergeClass';

const variants = {
    default: 'bg-zinc-800 text-zinc-300',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-red-500/10 text-red-500',
    primary: 'bg-primary/10 text-primary',
};

export const Badge = ({ className, variant = 'default', children, ...props }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
