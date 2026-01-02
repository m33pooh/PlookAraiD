import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-900/80 text-emerald-400',
    warning: 'bg-amber-900/80 text-amber-400',
    danger: 'bg-rose-900/80 text-rose-400',
    info: 'bg-blue-900/80 text-blue-400',
    outline: 'bg-transparent border border-slate-600 text-slate-400',
};

const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-medium rounded-lg whitespace-nowrap',
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

// Status-specific badge helpers
export function StatusBadge({ status, type }: { status: string; type: 'cultivation' | 'demand' | 'contract' }) {
    const cultivationVariants: Record<string, BadgeVariant> = {
        PLANNING: 'info',
        GROWING: 'warning',
        HARVESTED: 'success',
        SOLD: 'default',
    };

    const demandVariants: Record<string, BadgeVariant> = {
        OPEN: 'success',
        CLOSED: 'default',
        FULFILLED: 'info',
    };

    const contractVariants: Record<string, BadgeVariant> = {
        DRAFT: 'outline',
        SIGNED: 'info',
        COMPLETED: 'success',
        CANCELLED: 'danger',
    };

    const cultivationLabels: Record<string, string> = {
        PLANNING: 'วางแผน',
        GROWING: 'กำลังเพาะปลูก',
        HARVESTED: 'เก็บเกี่ยวแล้ว',
        SOLD: 'ขายแล้ว',
    };

    const demandLabels: Record<string, string> = {
        OPEN: 'เปิดรับ',
        CLOSED: 'ปิดแล้ว',
        FULFILLED: 'ครบถ้วน',
    };

    const contractLabels: Record<string, string> = {
        DRAFT: 'แบบร่าง',
        SIGNED: 'ลงนามแล้ว',
        COMPLETED: 'เสร็จสิ้น',
        CANCELLED: 'ยกเลิก',
    };

    let variant: BadgeVariant = 'default';
    let label = status;

    if (type === 'cultivation') {
        variant = cultivationVariants[status] || 'default';
        label = cultivationLabels[status] || status;
    } else if (type === 'demand') {
        variant = demandVariants[status] || 'default';
        label = demandLabels[status] || status;
    } else if (type === 'contract') {
        variant = contractVariants[status] || 'default';
        label = contractLabels[status] || status;
    }

    return <Badge variant={variant}>{label}</Badge>;
}

export { Badge };
