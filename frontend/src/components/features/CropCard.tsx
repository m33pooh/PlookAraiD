'use client';

import { Crop } from '@/types';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface CropCardProps {
    data: Crop;
    matchScore?: number;
    onSelect?: (crop: Crop) => void;
}

export const CropCard = ({ data, matchScore, onSelect }: CropCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (onSelect) {
            onSelect(data);
        } else {
            router.push(`/search/${data.id}`);
        }
    };

    const getTrendIcon = () => {
        switch (data.currentPrice.trend) {
            case 'up':
                return <TrendingUp className="text-emerald-500" size={20} />;
            case 'down':
                return <TrendingDown className="text-rose-500" size={20} />;
            default:
                return <Minus className="text-slate-400" size={20} />;
        }
    };

    const getDemandBadge = () => {
        const colors = {
            high: 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
            medium: 'bg-amber-900/50 text-amber-400 border-amber-700',
            low: 'bg-slate-700 text-slate-400 border-slate-600',
        };
        const labels = {
            high: 'ความต้องการสูง',
            medium: 'ความต้องการปานกลาง',
            low: 'ความต้องการต่ำ',
        };
        return (
            <span className={`text-xs px-2 py-0.5 rounded border ${colors[data.marketDemand]}`}>
                {labels[data.marketDemand]}
            </span>
        );
    };

    return (
        <Card
            variant="elevated"
            className="p-4 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
            onClick={handleClick}
        >
            {/* Match Score Badge */}
            {matchScore !== undefined && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-400 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md">
                    {matchScore}% เหมาะสม
                </div>
            )}

            <div className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {data.imageUrl ? (
                        <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">🌱</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">{data.name}</h3>

                    <div className="flex items-center gap-2 mt-1 mb-3 flex-wrap">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                            {data.growthDurationDays} วัน
                        </span>
                        {getDemandBadge()}
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-slate-400">ราคาปัจจุบัน</p>
                            <div className="flex items-end gap-1">
                                <span className="font-bold text-emerald-400 text-lg">
                                    {data.currentPrice.min.toLocaleString()}-{data.currentPrice.max.toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-400 mb-1">
                                    {data.currentPrice.unit}
                                </span>
                            </div>
                        </div>
                        {getTrendIcon()}
                    </div>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

            {/* Arrow on hover */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="text-emerald-400" size={24} />
            </div>
        </Card>
    );
};
