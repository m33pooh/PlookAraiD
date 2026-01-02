'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import {
    ArrowLeft,
    MapPin,
    Droplets,
    Maximize,
    Sprout,
    Edit,
    Plus,
    Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Cultivation {
    id: string;
    startDate: string;
    expectedHarvestDate: string;
    estimatedYield: number | null;
    status: string;
    product: {
        id: number;
        name: string;
    };
}

interface Farm {
    id: string;
    name: string;
    locationLat: number;
    locationLng: number;
    areaSize: number;
    soilType: string | null;
    waterSource: string;
    farmer: {
        id: string;
        username: string;
        email: string;
    };
    cultivations: Cultivation[];
}

const waterSourceLabels: Record<string, string> = {
    IRRIGATION: 'ชลประทาน',
    GROUNDWATER: 'น้ำบาดาล',
    RAIN: 'น้ำฝน',
};

export default function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [farm, setFarm] = useState<Farm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFarm = async () => {
            try {
                const response = await fetch(`/api/farms/${id}`);
                if (!response.ok) {
                    throw new Error('Farm not found');
                }
                const data = await response.json();
                setFarm(data);
            } catch (err) {
                setError('ไม่พบข้อมูลแปลงเกษตร');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFarm();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    if (error || !farm) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error || 'ไม่พบข้อมูล'}</p>
                <Link href="/farmer/farms">
                    <Button variant="outline">กลับสู่รายการแปลงเกษตร</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/farmer/farms">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{farm.name}</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">
                                {Number(farm.locationLat).toFixed(4)}, {Number(farm.locationLng).toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href={`/farmer/farms/${farm.id}/edit`}>
                    <Button variant="outline" className="gap-2">
                        <Edit size={16} />
                        แก้ไข
                    </Button>
                </Link>
            </div>

            {/* Farm Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Maximize className="text-emerald-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">ขนาดพื้นที่</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {Number(farm.areaSize).toFixed(2)} ไร่
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Droplets className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">แหล่งน้ำ</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {waterSourceLabels[farm.waterSource] || farm.waterSource}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Sprout className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">การเพาะปลูก</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {farm.cultivations.length} รอบ
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Info */}
            {farm.soilType && (
                <Card>
                    <CardContent className="p-4">
                        <span className="text-slate-500">ประเภทดิน: </span>
                        <span className="font-medium text-slate-700">{farm.soilType}</span>
                    </CardContent>
                </Card>
            )}

            {/* Cultivations List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sprout className="text-emerald-600" size={20} />
                        ประวัติการเพาะปลูก
                    </CardTitle>
                    <Link href={`/farmer/cultivations/new?farmId=${farm.id}`}>
                        <Button size="sm" className="gap-1">
                            <Plus size={16} />
                            เริ่มปลูกใหม่
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {farm.cultivations.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            ยังไม่มีประวัติการเพาะปลูกในแปลงนี้
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {farm.cultivations.map((cult) => (
                                <Link
                                    key={cult.id}
                                    href={`/farmer/cultivations/${cult.id}`}
                                    className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800">
                                            {cult.product.name}
                                        </span>
                                        <StatusBadge status={cult.status} type="cultivation" />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(cult.startDate)}
                                        </span>
                                        {cult.estimatedYield && (
                                            <span>ผลผลิตคาดการณ์: {Number(cult.estimatedYield).toLocaleString()} กก.</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
