import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: { value: string | number; label: string }[];
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-slate-200 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    className={cn(
                        'flex h-11 w-full rounded-lg border bg-slate-800 px-4 py-2 text-sm text-slate-200',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-900',
                        'appearance-none cursor-pointer',
                        'bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat',
                        error
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                            : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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

Select.displayName = 'Select';

export { Select };
