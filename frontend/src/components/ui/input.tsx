import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, id, ...props }, ref) => {
        // Use React's useId for SSR-safe unique IDs
        const reactId = React.useId();
        const inputId = id || reactId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-200 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        'flex h-11 w-full rounded-lg border bg-slate-800 px-4 py-2 text-sm text-slate-200',
                        'transition-all duration-200',
                        'placeholder:text-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-900',
                        error
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                            : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-rose-500">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };

