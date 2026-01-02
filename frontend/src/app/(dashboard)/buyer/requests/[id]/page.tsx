'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import {
    ArrowLeft,
    Calendar,
    ShoppingCart,
    Users,
    Edit,
    X,
    CheckCircle,
} from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/utils';

interface Contract {
    id: string;
    status: string;
    agreedPrice: number;
    agreedQuantity: number;
    farmer: {
        id: string;
        username: string;
    };
    cultivation: {
        id: string;
        farm: {
            id: string;
            name: string;
        };
    };
}

interface BuyRequest {
    id: string;
    quantityRequired: number;
    priceOffered: number | null;
    description: string | null;
    expiryDate: string;
    status: string;
    createdAt: string;
    buyer: {
        id: string;
        username: string;
        email: string;
        phoneNumber: string | null;
    };
    product: {
        id: number;
        name: string;
    };
    contracts: Contract[];
}

export default function BuyRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [request, setRequest] = useState<BuyRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await fetch(`/api/buy-requests/${id}`);
                if (!response.ok) {
                    throw new Error('Request not found');
                }
                const data = await response.json();
                setRequest(data);
            } catch (err) {
                setError('ไม่พบข้อมูลประกาศรับซื้อ');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    const handleCloseRequest = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/buy-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLOSED' }),
            });

            if (!response.ok) throw new Error('Failed to update');

            setRequest((prev) => (prev ? { ...prev, status: 'CLOSED' } : prev));
            setShowCloseModal(false);
        } catch (err) {
            console.error('Error closing request:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error || 'ไม่พบข้อมูล'}</p>
                <Link href="/buyer/requests">
                    <Button variant="outline">กลับสู่รายการ</Button>
                </Link>
            </div>
        );
    }

    const isExpired = new Date(request.expiryDate) < new Date();
    const totalOfferedQty = request.contracts.reduce((sum, c) => sum + Number(c.agreedQuantity), 0);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/buyer/requests">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-800">
                                {request.product.name}
                            </h1>
                            <StatusBadge status={request.status} type="demand" />
                        </div>
                        <p className="text-slate-500 mt-1">
                            สร้างเมื่อ {formatDate(request.createdAt)}
                        </p>
                    </div>
                </div>

                {request.status === 'OPEN' && (
                    <div className="flex gap-2">
                        <Link href={`/buyer/requests/${id}/edit`}>
                            <Button variant="outline" className="gap-2">
                                <Edit size={16} />
                                แก้ไข
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => setShowCloseModal(true)}
                            className="gap-2 text-rose-600 hover:bg-rose-50"
                        >
                            <X size={16} />
                            ปิดประกาศ
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="text-emerald-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">ปริมาณที่ต้องการ</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {Number(request.quantityRequired).toLocaleString()} กก.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">ข้อเสนอ</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {request.contracts.length} รายการ
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Calendar className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">หมดอายุ</p>
                                <p className={`text-xl font-bold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {formatDate(request.expiryDate)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Request Details */}
            <Card>
                <CardHeader>
                    <CardTitle>รายละเอียดประกาศ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">สินค้า</p>
                            <p className="font-medium">{request.product.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">ราคาที่เสนอ</p>
                            <p className="font-medium">
                                {request.priceOffered
                                    ? `${formatMoney(Number(request.priceOffered))}/กก.`
                                    : 'รอเกษตรกรเสนอราคา'}
                            </p>
                        </div>
                    </div>

                    {request.description && (
                        <div>
                            <p className="text-sm text-slate-500 mb-1">รายละเอียดเพิ่มเติม</p>
                            <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
                        </div>
                    )}

                    {/* Progress indicator */}
                    <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">ปริมาณที่ได้รับข้อเสนอ</span>
                            <span className="font-medium">
                                {totalOfferedQty.toLocaleString()} / {Number(request.quantityRequired).toLocaleString()} กก.
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                    width: `${Math.min((totalOfferedQty / Number(request.quantityRequired)) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Offers List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        ข้อเสนอจากเกษตรกร ({request.contracts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {request.contracts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            ยังไม่มีข้อเสนอจากเกษตรกร
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {request.contracts.map((contract) => (
                                <Link
                                    key={contract.id}
                                    href={`/buyer/contracts/${contract.id}`}
                                    className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {contract.farmer.username}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {contract.cultivation.farm.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-emerald-600">
                                                {formatMoney(Number(contract.agreedPrice))}/กก.
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {Number(contract.agreedQuantity).toLocaleString()} กก.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <StatusBadge status={contract.status} type="contract" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Close Confirmation Modal */}
            <ConfirmModal
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                onConfirm={handleCloseRequest}
                title="ปิดประกาศรับซื้อ"
                message="คุณแน่ใจหรือไม่ที่จะปิดประกาศนี้? เกษตรกรจะไม่สามารถส่งข้อเสนอใหม่ได้"
                confirmText="ปิดประกาศ"
                variant="warning"
                isLoading={isUpdating}
            />
        </div>
    );
}
