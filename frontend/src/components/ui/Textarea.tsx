import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-slate-200 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        'flex min-h-[100px] w-full rounded-lg border bg-slate-800 px-4 py-3 text-sm text-slate-200',
                        'transition-all duration-200 resize-y',
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

Textarea.displayName = 'Textarea';

export { Textarea };
