'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import {
    Sprout,
    Plus,
    Calendar,
    MapPin,
    Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Cultivation {
    id: string;
    startDate: string;
    expectedHarvestDate: string;
    estimatedYield: number | null;
    status: string;
    farm: {
        id: string;
        name: string;
        farmer: {
            id: string;
            username: string;
        };
    };
    product: {
        id: number;
        name: string;
    };
    contract: {
        id: string;
        status: string;
    } | null;
}

const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'PLANNING', label: 'วางแผน' },
    { value: 'GROWING', label: 'กำลังเพาะปลูก' },
    { value: 'HARVESTED', label: 'เก็บเกี่ยวแล้ว' },
    { value: 'SOLD', label: 'ขายแล้ว' },
];

function calculateProgress(startDate: string, expectedHarvestDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(expectedHarvestDate).getTime();
    const now = Date.now();

    if (now >= end) return 100;
    if (now <= start) return 0;

    return Math.round(((now - start) / (end - start)) * 100);
}

function daysUntil(date: string): number {
    const targetDate = new Date(date).getTime();
    const now = Date.now();
    return Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
}

export default function CultivationsPage() {
    const [cultivations, setCultivations] = useState<Cultivation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCultivations();
    }, [statusFilter]);

    const fetchCultivations = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/cultivations?${params.toString()}`);
            const data = await response.json();
            setCultivations(data);
        } catch (error) {
            console.error('Error fetching cultivations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">การเพาะปลูกของฉัน</h1>
                    <p className="text-slate-500 mt-1">
                        ติดตามรอบการปลูกทั้งหมด {cultivations.length} รายการ
                    </p>
                </div>
                <Link href="/farmer/cultivations/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        เริ่มปลูกใหม่
                    </Button>
                </Link>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-slate-500" />
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-48"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Cultivations List */}
            {cultivations.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sprout className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        ยังไม่มีการเพาะปลูก
                    </h3>
                    <p className="text-slate-500 mb-4">
                        เริ่มต้นบันทึกการเพาะปลูกรอบแรกของคุณ
                    </p>
                    <Link href="/farmer/cultivations/new">
                        <Button className="gap-2">
                            <Plus size={18} />
                            เริ่มปลูกใหม่
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {cultivations.map((cult) => {
                        const progress = calculateProgress(cult.startDate, cult.expectedHarvestDate);
                        const daysLeft = daysUntil(cult.expectedHarvestDate);

                        return (
                            <Link
                                key={cult.id}
                                href={`/farmer/cultivations/${cult.id}`}
                                className="block"
                            >
                                <Card className="hover:shadow-md transition group">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Left: Crop & Farm Info */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                        🌾
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition">
                                                            {cult.product.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                                            <MapPin size={12} />
                                                            {cult.farm.name}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        เริ่ม: {formatDate(cult.startDate)}
                                                    </span>
                                                    <span>
                                                        คาดเก็บเกี่ยว: {formatDate(cult.expectedHarvestDate)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: Status & Progress */}
                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge status={cult.status} type="cultivation" />

                                                {cult.status === 'GROWING' && (
                                                    <div className="text-right">
                                                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {daysLeft > 0
                                                                ? `อีก ${daysLeft} วัน`
                                                                : 'ถึงกำหนด'}
                                                        </p>
                                                    </div>
                                                )}

                                                {cult.contract && (
                                                    <span className="text-xs text-blue-600">
                                                        มีสัญญารับซื้อ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
