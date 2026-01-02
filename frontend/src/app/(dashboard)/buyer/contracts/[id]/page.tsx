'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/Badge';
import {
    ArrowLeft,
    FileText,
    User,
    MapPin,
    Calendar,
    Phone,
    Mail,
} from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/utils';

interface Contract {
    id: string;
    agreedPrice: number;
    agreedQuantity: number;
    status: string;
    signedAt: string | null;
    farmer: {
        id: string;
        username: string;
        email: string;
        phoneNumber: string | null;
        profile: {
            fullName: string | null;
            address: string | null;
        } | null;
    };
    buyer: {
        id: string;
        username: string;
        email: string;
        phoneNumber: string | null;
        profile: {
            fullName: string | null;
            address: string | null;
        } | null;
    };
    cultivation: {
        id: string;
        startDate: string;
        expectedHarvestDate: string;
        product: {
            id: number;
            name: string;
        };
        farm: {
            id: string;
            name: string;
        };
    };
    buyRequest: {
        id: string;
        description: string | null;
    };
}

export default function BuyerContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await fetch(`/api/contracts/${id}`);
                if (!response.ok) {
                    throw new Error('Contract not found');
                }
                const data = await response.json();
                setContract(data);
            } catch (err) {
                setError('ไม่พบข้อมูลสัญญา');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContract();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error || 'ไม่พบข้อมูล'}</p>
                <Link href="/buyer/contracts">
                    <Button variant="outline">กลับสู่รายการ</Button>
                </Link>
            </div>
        );
    }

    const totalValue = Number(contract.agreedPrice) * Number(contract.agreedQuantity);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/buyer/contracts">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                            สัญญา: {contract.cultivation.product.name}
                        </h1>
                        <StatusBadge status={contract.status} type="contract" />
                    </div>
                    {contract.signedAt && (
                        <p className="text-slate-500 mt-1">
                            ลงนามเมื่อ {formatDate(contract.signedAt)}
                        </p>
                    )}
                </div>
            </div>

            {/* Status Banner */}
            {contract.status === 'DRAFT' && (
                <div className="p-4 bg-amber-900/30 rounded-xl border border-amber-700/50">
                    <p className="text-amber-400">
                        ⏳ รอเกษตรกรลงนามสัญญา - เราจะแจ้งเตือนคุณเมื่อมีการอัปเดต
                    </p>
                </div>
            )}

            {contract.status === 'SIGNED' && (
                <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-700/50">
                    <p className="text-blue-400">
                        📦 สัญญาลงนามแล้ว - รอการส่งมอบสินค้าจากเกษตรกร
                    </p>
                </div>
            )}

            {contract.status === 'COMPLETED' && (
                <div className="p-4 bg-emerald-900/30 rounded-xl border border-emerald-700/50">
                    <p className="text-emerald-400">
                        ✅ สัญญาเสร็จสิ้น - ส่งมอบสินค้าเรียบร้อยแล้ว
                    </p>
                </div>
            )}

            {/* Contract Summary */}
            <Card variant="elevated" className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-700/30">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-sm text-slate-500">ราคาที่ตกลง</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatMoney(Number(contract.agreedPrice))}/กก.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">ปริมาณ</p>
                            <p className="text-2xl font-bold text-white">
                                {Number(contract.agreedQuantity).toLocaleString()} กก.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">มูลค่ารวม</p>
                            <p className="text-2xl font-bold text-white">
                                {formatMoney(totalValue)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Farmer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="text-emerald-600" size={18} />
                            ข้อมูลเกษตรกร
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-slate-500">ชื่อ</p>
                            <p className="font-medium">
                                {contract.farmer.profile?.fullName || contract.farmer.username}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            <p className="text-sm">{contract.farmer.email}</p>
                        </div>
                        {contract.farmer.phoneNumber && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                <p className="text-sm">{contract.farmer.phoneNumber}</p>
                            </div>
                        )}
                        {contract.farmer.profile?.address && (
                            <div>
                                <p className="text-sm text-slate-500">ที่อยู่</p>
                                <p className="text-sm">{contract.farmer.profile.address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cultivation Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="text-blue-600" size={18} />
                            ข้อมูลการเพาะปลูก
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-slate-500">พืช</p>
                            <p className="font-medium">{contract.cultivation.product.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">แปลงเกษตร</p>
                            <p className="font-medium">{contract.cultivation.farm.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm">
                                เริ่ม: {formatDate(contract.cultivation.startDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-500" />
                            <span className="text-sm">
                                คาดเก็บเกี่ยว: {formatDate(contract.cultivation.expectedHarvestDate)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contract Terms */}
            {contract.buyRequest.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="text-purple-600" size={18} />
                            เงื่อนไขจากประกาศรับซื้อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-300 whitespace-pre-wrap">
                            {contract.buyRequest.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Link back to buy request */}
            <Card>
                <CardContent className="p-4">
                    <Link
                        href={`/buyer/requests/${contract.buyRequest.id}`}
                        className="flex items-center justify-between text-sm text-emerald-600 hover:text-emerald-700"
                    >
                        <span>ดูประกาศรับซื้อที่เกี่ยวข้อง</span>
                        <ArrowLeft size={14} className="rotate-180" />
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
