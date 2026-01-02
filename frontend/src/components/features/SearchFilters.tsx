'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Droplets, Maximize } from 'lucide-react';
import { WaterSource, ProductCategory } from '@/types';

interface SearchFiltersProps {
    initialValues?: {
        lat?: string;
        lng?: string;
        water?: string;
        size?: string;
        category?: string;
    };
}

const waterSourceOptions: { value: WaterSource; label: string; icon: string }[] = [
    { value: 'IRRIGATION', label: 'ชลประทาน', icon: '🚿' },
    { value: 'GROUNDWATER', label: 'น้ำบาดาล', icon: '💧' },
    { value: 'RAIN', label: 'น้ำฝน', icon: '🌧️' },
];

const categoryOptions: { value: ProductCategory | 'ALL'; label: string; icon: string }[] = [
    { value: 'ALL', label: 'ทั้งหมด', icon: '🌍' },
    { value: 'CROP', label: 'พืชผัก', icon: '🥬' },
    { value: 'LIVESTOCK', label: 'ปศุสัตว์', icon: '🐄' },
    { value: 'AQUATIC', label: 'สัตว์น้ำ', icon: '🐟' },
];

export const SearchFilters = ({ initialValues }: SearchFiltersProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [waterSource, setWaterSource] = useState(initialValues?.water || '');
    const [category, setCategory] = useState(initialValues?.category || 'ALL');
    const [farmSize, setFarmSize] = useState(initialValues?.size || '');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (waterSource) params.set('water', waterSource);
        else params.delete('water');

        if (category && category !== 'ALL') params.set('category', category);
        else params.delete('category');

        if (farmSize) params.set('size', farmSize);
        else params.delete('size');

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 p-6">
            {/* Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Water Source */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                        <Droplets size={16} className="text-blue-500" />
                        แหล่งน้ำ
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {waterSourceOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setWaterSource(option.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${waterSource === option.value
                                    ? 'bg-emerald-900/80 text-emerald-400 border-2 border-emerald-500'
                                    : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                        <Filter size={16} className="text-purple-500" />
                        ประเภท
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setCategory(option.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === option.value
                                    ? 'bg-purple-900/80 text-purple-400 border-2 border-purple-500'
                                    : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Farm Size */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                        <Maximize size={16} className="text-amber-500" />
                        ขนาดพื้นที่ (ไร่)
                    </label>
                    <input
                        type="number"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        placeholder="เช่น 5"
                        className="w-full h-10 px-4 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                    <MapPin size={14} />
                    {showAdvanced ? 'ซ่อนตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
                </button>

                <Button onClick={applyFilters} className="gap-2">
                    <Search size={16} />
                    ค้นหา
                </Button>
            </div>
        </div>
    );
};
