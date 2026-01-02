'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Percent, Tag, Package, Truck, Gift } from 'lucide-react';

interface Promotion {
    id: string;
    name: string;
    description?: string;
    type: string;
    discountValue?: number;
    minPurchase?: number;
    startDate: string;
    endDate: string;
    imageUrl?: string;
    status: string;
}

interface PromotionCardProps {
    promotion: Promotion;
    onClick?: (promotion: Promotion) => void;
}

export const PromotionCard = ({ promotion, onClick }: PromotionCardProps) => {
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const endDate = new Date(promotion.endDate);
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        setDaysLeft(days);
    }, [promotion.endDate]);

    const getTypeIcon = () => {
        switch (promotion.type) {
            case 'PERCENTAGE_DISCOUNT':
                return <Percent size={20} />;
            case 'FIXED_DISCOUNT':
                return <Tag size={20} />;
            case 'FREE_SHIPPING':
                return <Truck size={20} />;
            case 'BUNDLE_DEAL':
                return <Package size={20} />;
            default:
                return <Gift size={20} />;
        }
    };

    const getDiscountLabel = () => {
        switch (promotion.type) {
            case 'PERCENTAGE_DISCOUNT':
                return `${promotion.discountValue}%`;
            case 'FIXED_DISCOUNT':
                return `฿${promotion.discountValue?.toLocaleString()}`;
            case 'FREE_SHIPPING':
                return 'ฟรี';
            case 'BUNDLE_DEAL':
                return 'พิเศษ';
            default:
                return '';
        }
    };

    const getTypeLabel = () => {
        switch (promotion.type) {
            case 'PERCENTAGE_DISCOUNT':
                return 'ส่วนลด %';
            case 'FIXED_DISCOUNT':
                return 'ลดราคา';
            case 'FREE_SHIPPING':
                return 'ฟรีค่าส่ง';
            case 'BUNDLE_DEAL':
                return 'แพ็คเกจ';
            default:
                return 'โปรโมชั่น';
        }
    };

    return (
        <Card
            variant="elevated"
            className="relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
            onClick={() => onClick?.(promotion)}
        >
            {/* Discount Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-pink-500 text-white text-lg font-bold px-4 py-2 rounded-bl-xl shadow-lg z-10">
                {getDiscountLabel()}
            </div>

            {/* Image or Gradient */}
            <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                {promotion.imageUrl ? (
                    <img
                        src={promotion.imageUrl}
                        alt={promotion.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-emerald-400 animate-pulse">
                        <Gift size={48} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Type Badge */}
                <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-full mb-2">
                    {getTypeIcon()}
                    {getTypeLabel()}
                </div>

                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-emerald-400 transition">
                    {promotion.name}
                </h3>

                {promotion.description && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                        {promotion.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    {promotion.minPurchase && (
                        <span className="text-xs text-slate-500">
                            ขั้นต่ำ ฿{promotion.minPurchase.toLocaleString()}
                        </span>
                    )}

                    {daysLeft !== null && (
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-medium ml-auto">
                            <Clock size={14} />
                            {daysLeft === 0 ? 'วันสุดท้าย!' : `อีก ${daysLeft} วัน`}
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>
    );
};
