'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Gift, ArrowRight, Sparkles } from 'lucide-react';

interface Promotion {
    id: string;
    name: string;
    description?: string;
    type: string;
    discountValue?: number;
    startDate: string;
    endDate: string;
    bannerUrl?: string;
}

interface PromotionBannerProps {
    promotion?: Promotion;
    className?: string;
}

export const PromotionBanner = ({ promotion, className = '' }: PromotionBannerProps) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        if (!promotion) return;

        const calculateTimeLeft = () => {
            const endDate = new Date(promotion.endDate);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [promotion]);

    if (!promotion) {
        return null;
    }

    const getDiscountLabel = () => {
        switch (promotion.type) {
            case 'PERCENTAGE_DISCOUNT':
                return `ลด ${promotion.discountValue}%`;
            case 'FIXED_DISCOUNT':
                return `ลด ฿${promotion.discountValue?.toLocaleString()}`;
            case 'FREE_SHIPPING':
                return 'ฟรีค่าจัดส่ง';
            case 'BUNDLE_DEAL':
                return 'โปรโมชั่นพิเศษ';
            default:
                return 'โปรโมชั่น';
        }
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 lg:p-8 ${className}`}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Sparkles Animation */}
            <div className="absolute top-4 right-4 text-yellow-300 animate-bounce">
                <Sparkles size={24} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-4">
                        <Gift size={16} />
                        <span>โปรโมชั่นพิเศษ</span>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {promotion.name}
                    </h2>

                    <div className="text-3xl lg:text-4xl font-black text-yellow-300 mb-3">
                        {getDiscountLabel()}
                    </div>

                    {promotion.description && (
                        <p className="text-white/80 text-sm lg:text-base mb-4 max-w-md">
                            {promotion.description}
                        </p>
                    )}

                    <Link
                        href={`/promotions/${promotion.id}`}
                        className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 hover:text-emerald-800 transition-all transform hover:scale-105 shadow-lg"
                    >
                        ดูรายละเอียด
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Countdown Timer */}
                {timeLeft && (
                    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 lg:p-6">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-3 justify-center">
                            <Clock size={16} />
                            <span>เหลือเวลาอีก</span>
                        </div>

                        <div className="flex gap-3">
                            {[
                                { value: timeLeft.days, label: 'วัน' },
                                { value: timeLeft.hours, label: 'ชม.' },
                                { value: timeLeft.minutes, label: 'นาที' },
                                { value: timeLeft.seconds, label: 'วินาที' },
                            ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="bg-slate-900/60 rounded-lg px-3 py-2 min-w-[50px]">
                                        <span className="text-2xl font-bold text-white">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className="text-white/60 text-xs mt-1 block">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
