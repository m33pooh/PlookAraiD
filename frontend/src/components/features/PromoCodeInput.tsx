'use client';

import { useState } from 'react';
import { Ticket, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AppliedPromo {
    id: string;
    name: string;
    type: string;
    discountValue?: number;
    minPurchase?: number;
    maxDiscount?: number;
}

interface PromoCodeInputProps {
    productId?: number;
    onApply?: (promo: AppliedPromo) => void;
    onRemove?: () => void;
    className?: string;
}

export const PromoCodeInput = ({
    productId,
    onApply,
    onRemove,
    className = '',
}: PromoCodeInputProps) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

    const handleValidate = async () => {
        if (!code.trim()) {
            setError('กรุณากรอกรหัสโปรโมชั่น');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/promo-codes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim(), productId }),
            });

            const data = await response.json();

            if (!data.valid) {
                setError(data.error || 'รหัสโปรโมชั่นไม่ถูกต้อง');
                return;
            }

            const promo: AppliedPromo = {
                id: data.promotion.id,
                name: data.promotion.name,
                type: data.promotion.type,
                discountValue: data.promotion.discountValue,
                minPurchase: data.promotion.minPurchase,
                maxDiscount: data.promotion.maxDiscount,
            };

            setAppliedPromo(promo);
            onApply?.(promo);
        } catch (err) {
            console.error('Error validating promo code:', err);
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = () => {
        setCode('');
        setAppliedPromo(null);
        setError(null);
        onRemove?.();
    };

    const getDiscountLabel = () => {
        if (!appliedPromo) return '';
        switch (appliedPromo.type) {
            case 'PERCENTAGE_DISCOUNT':
                return `ลด ${appliedPromo.discountValue}%`;
            case 'FIXED_DISCOUNT':
                return `ลด ฿${appliedPromo.discountValue?.toLocaleString()}`;
            case 'FREE_SHIPPING':
                return 'ฟรีค่าจัดส่ง';
            case 'BUNDLE_DEAL':
                return 'โปรโมชั่นพิเศษ';
            default:
                return 'โปรโมชั่น';
        }
    };

    if (appliedPromo) {
        return (
            <div className={`bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="text-emerald-400 font-medium text-sm">
                                ใช้โปรโมชั่นแล้ว
                            </p>
                            <p className="text-white font-bold">
                                {appliedPromo.name} - {getDiscountLabel()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="text-slate-400 hover:text-rose-400 transition p-2"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Ticket size={16} className="text-emerald-400" />
                รหัสโปรโมชั่น
            </label>

            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="กรอกรหัสโปรโมชั่น"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                    className="flex-1 uppercase"
                    disabled={isLoading}
                />
                <Button
                    variant="secondary"
                    onClick={handleValidate}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        'ใช้โค้ด'
                    )}
                </Button>
            </div>

            {error && (
                <p className="text-rose-400 text-sm mt-2 flex items-center gap-1">
                    <X size={14} />
                    {error}
                </p>
            )}
        </div>
    );
};
