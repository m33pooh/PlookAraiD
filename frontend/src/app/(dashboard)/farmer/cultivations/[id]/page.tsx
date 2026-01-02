'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Sprout,
    FileText,
    ArrowRight,
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
            email: string;
        };
    };
    product: {
        id: number;
        name: string;
        growthDurationDays: number;
    };
    contract: {
        id: string;
        status: string;
        buyer: {
            id: string;
            username: string;
        };
    } | null;
}

const statusFlow: Record<string, { next: string; label: string }> = {
    PLANNING: { next: 'GROWING', label: 'เริ่มเพาะปลูก' },
    GROWING: { next: 'HARVESTED', label: 'บันทึกการเก็บเกี่ยว' },
    HARVESTED: { next: 'SOLD', label: 'บันทึกการขาย' },
};

export default function CultivationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [cultivation, setCultivation] = useState<Cultivation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHarvestModal, setShowHarvestModal] = useState(false);
    const [actualYield, setActualYield] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchCultivation = async () => {
            try {
                const response = await fetch(`/api/cultivations/${id}`);
                if (!response.ok) {
                    throw new Error('Cultivation not found');
                }
                const data = await response.json();
                setCultivation(data);
            } catch (err) {
                setError('ไม่พบข้อมูลการเพาะปลูก');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCultivation();
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        if (!cultivation) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/cultivations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    ...(newStatus === 'HARVESTED' && actualYield && { estimatedYield: parseFloat(actualYield) }),
                }),
            });

            if (!response.ok) throw new Error('Failed to update');

            const updated = await response.json();
            setCultivation((prev) => (prev ? { ...prev, status: updated.status } : prev));
            setShowHarvestModal(false);
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusUpdate = () => {
        if (!cultivation) return;

        const nextStatus = statusFlow[cultivation.status]?.next;
        if (!nextStatus) return;

        if (nextStatus === 'HARVESTED') {
            setShowHarvestModal(true);
        } else {
            updateStatus(nextStatus);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    if (error || !cultivation) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error || 'ไม่พบข้อมูล'}</p>
                <Link href="/farmer/cultivations">
                    <Button variant="outline">กลับสู่รายการ</Button>
                </Link>
            </div>
        );
    }

    const progress = (() => {
        const start = new Date(cultivation.startDate).getTime();
        const end = new Date(cultivation.expectedHarvestDate).getTime();
        const now = Date.now();
        if (now >= end) return 100;
        if (now <= start) return 0;
        return Math.round(((now - start) / (end - start)) * 100);
    })();

    const nextAction = statusFlow[cultivation.status];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/farmer/cultivations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-800">
                                {cultivation.product.name}
                            </h1>
                            <StatusBadge status={cultivation.status} type="cultivation" />
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">{cultivation.farm.name}</span>
                        </div>
                    </div>
                </div>

                {nextAction && (
                    <Button onClick={handleStatusUpdate} disabled={isUpdating} className="gap-2">
                        {nextAction.label}
                        <ArrowRight size={16} />
                    </Button>
                )}
            </div>

            {/* Progress Card */}
            <Card variant="elevated">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-500">ความคืบหน้า</span>
                        <span className="text-sm font-medium text-slate-700">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-slate-500">
                        <span>{formatDate(cultivation.startDate)}</span>
                        <span>{formatDate(cultivation.expectedHarvestDate)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="text-emerald-600" size={18} />
                            ข้อมูลการปลูก
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">พืช</span>
                            <span className="font-medium">{cultivation.product.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">วันที่เริ่มปลูก</span>
                            <span className="font-medium">{formatDate(cultivation.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">คาดเก็บเกี่ยว</span>
                            <span className="font-medium">{formatDate(cultivation.expectedHarvestDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">ระยะเวลาปลูก</span>
                            <span className="font-medium">{cultivation.product.growthDurationDays} วัน</span>
                        </div>
                        {cultivation.estimatedYield && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">ผลผลิตคาดการณ์</span>
                                <span className="font-medium">
                                    {Number(cultivation.estimatedYield).toLocaleString()} กก.
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="text-blue-600" size={18} />
                            แปลงเกษตร
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={`/farmer/farms/${cultivation.farm.id}`}
                            className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                        >
                            <p className="font-medium text-slate-800">{cultivation.farm.name}</p>
                            <p className="text-sm text-emerald-600 mt-1">ดูรายละเอียด →</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Contract Info */}
            {cultivation.contract ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="text-purple-600" size={18} />
                            สัญญารับซื้อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={`/farmer/contracts/${cultivation.contract.id}`}
                            className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800">
                                        ผู้รับซื้อ: {cultivation.contract.buyer.username}
                                    </p>
                                    <StatusBadge status={cultivation.contract.status} type="contract" />
                                </div>
                                <ArrowRight size={18} className="text-purple-600" />
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                        <p className="text-slate-500 mb-3">ยังไม่มีสัญญารับซื้อ</p>
                        <Link href="/search">
                            <Button variant="outline" size="sm">
                                ค้นหาผู้รับซื้อ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Harvest Modal */}
            <Modal
                isOpen={showHarvestModal}
                onClose={() => setShowHarvestModal(false)}
                title="บันทึกการเก็บเกี่ยว"
                description="กรอกผลผลิตจริงที่ได้จากการเก็บเกี่ยว"
            >
                <div className="space-y-4">
                    <Input
                        label="ผลผลิตจริง (กิโลกรัม)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={actualYield}
                        onChange={(e) => setActualYield(e.target.value)}
                        placeholder="เช่น 1500"
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowHarvestModal(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={() => updateStatus('HARVESTED')} disabled={isUpdating}>
                            {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการเก็บเกี่ยว'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
