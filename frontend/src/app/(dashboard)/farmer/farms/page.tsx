'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import {
    MapPin,
    Plus,
    Droplets,
    Maximize,
    Sprout,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/Modal';

interface Farm {
    id: string;
    name: string;
    locationLat: number;
    locationLng: number;
    areaSize: number;
    soilType: string | null;
    waterSource: string;
    cultivations: { id: string }[];
}

const waterSourceLabels: Record<string, string> = {
    IRRIGATION: 'ชลประทาน',
    GROUNDWATER: 'น้ำบาดาล',
    RAIN: 'น้ำฝน',
};

export default function FarmsPage() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const response = await fetch('/api/farms');
            const data = await response.json();
            setFarms(data);
        } catch (error) {
            console.error('Error fetching farms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await fetch(`/api/farms/${deleteId}`, { method: 'DELETE' });
            setFarms(farms.filter((f) => f.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting farm:', error);
        } finally {
            setIsDeleting(false);
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
                    <h1 className="text-2xl font-bold text-white">แปลงเกษตรของฉัน</h1>
                    <p className="text-slate-400 mt-1">
                        จัดการแปลงเกษตรทั้งหมด {farms.length} แปลง
                    </p>
                </div>
                <Link href="/farmer/farms/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        เพิ่มแปลงใหม่
                    </Button>
                </Link>
            </div>

            {/* Farm Cards Grid */}
            {farms.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        ยังไม่มีแปลงเกษตร
                    </h3>
                    <p className="text-slate-400 mb-4">
                        เริ่มต้นเพิ่มแปลงเกษตรแปลงแรกของคุณ
                    </p>
                    <Link href="/farmer/farms/new">
                        <Button className="gap-2">
                            <Plus size={18} />
                            เพิ่มแปลงใหม่
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farms.map((farm) => (
                        <Card key={farm.id} variant="elevated" className="group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{farm.name}</CardTitle>
                                    <div className="relative">
                                        <button className="p-1 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition">
                                            <MoreVertical size={18} className="text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Maximize size={16} className="text-slate-400" />
                                        <span className="text-slate-600">
                                            {Number(farm.areaSize).toFixed(1)} ไร่
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Droplets size={16} className="text-blue-500" />
                                        <span className="text-slate-600">
                                            {waterSourceLabels[farm.waterSource] || farm.waterSource}
                                        </span>
                                    </div>
                                </div>

                                {/* Soil Type */}
                                {farm.soilType && (
                                    <div className="text-sm text-slate-500">
                                        ดิน: {farm.soilType}
                                    </div>
                                )}

                                {/* Active Cultivations */}
                                <div className="flex items-center gap-2">
                                    <Sprout size={16} className="text-emerald-500" />
                                    <span className="text-sm text-slate-600">
                                        {farm.cultivations.length} รอบการปลูกที่กำลังดำเนินการ
                                    </span>
                                </div>

                                {/* Location Badge */}
                                <div className="pt-2 border-t border-slate-700">
                                    <Badge variant="outline" className="gap-1">
                                        <MapPin size={12} />
                                        {Number(farm.locationLat).toFixed(4)}, {Number(farm.locationLng).toFixed(4)}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Link href={`/farmer/farms/${farm.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full gap-1">
                                            <Eye size={14} />
                                            ดูรายละเอียด
                                        </Button>
                                    </Link>
                                    <Link href={`/farmer/farms/${farm.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit size={14} />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteId(farm.id)}
                                        className="text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="ลบแปลงเกษตร"
                message="คุณแน่ใจหรือไม่ที่จะลบแปลงเกษตรนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
                confirmText="ลบ"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
