import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', ...props }, ref) => {
        return (
            <button
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',

                    // Variants
                    {
                        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-lg hover:shadow-xl': variant === 'default' || variant === 'primary',
                        'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500': variant === 'secondary',
                        'border-2 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-emerald-500 focus-visible:ring-emerald-500': variant === 'outline',
                        'text-slate-400 hover:bg-slate-800 hover:text-white': variant === 'ghost',
                        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500': variant === 'destructive',
                    },

                    // Sizes
                    {
                        'h-8 px-3 text-sm': size === 'sm',
                        'h-10 px-4 text-sm': size === 'md',
                        'h-12 px-6 text-base': size === 'lg',
                    },

                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
