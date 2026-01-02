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
    FileText,
    User,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Truck,
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

export default function FarmerContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSignModal, setShowSignModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

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

    const updateContractStatus = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/contracts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');

            const updated = await response.json();
            setContract((prev) =>
                prev
                    ? { ...prev, status: updated.status, signedAt: updated.signedAt }
                    : prev
            );
            setShowSignModal(false);
            setShowCancelModal(false);
        } catch (err) {
            console.error('Error updating contract:', err);
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

    if (error || !contract) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error || 'ไม่พบข้อมูล'}</p>
                <Link href="/farmer/contracts">
                    <Button variant="outline">กลับสู่รายการ</Button>
                </Link>
            </div>
        );
    }

    const totalValue = Number(contract.agreedPrice) * Number(contract.agreedQuantity);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/farmer/contracts">
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

                {contract.status === 'DRAFT' && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(true)}
                            className="gap-2 text-rose-400 hover:bg-rose-900/30 hover:text-rose-400 border-slate-700"
                        >
                            <XCircle size={16} />
                            ปฏิเสธ
                        </Button>
                        <Button onClick={() => setShowSignModal(true)} className="gap-2">
                            <CheckCircle size={16} />
                            ลงนามสัญญา
                        </Button>
                    </div>
                )}

                {contract.status === 'SIGNED' && (
                    <Button
                        onClick={() => updateContractStatus('COMPLETED')}
                        disabled={isUpdating}
                        className="gap-2"
                    >
                        <Truck size={16} />
                        บันทึกส่งมอบสินค้า
                    </Button>
                )}
            </div>

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
                {/* Buyer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="text-blue-600" size={18} />
                            ข้อมูลผู้รับซื้อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-slate-500">ชื่อ</p>
                            <p className="font-medium">
                                {contract.buyer.profile?.fullName || contract.buyer.username}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">อีเมล</p>
                            <p className="font-medium">{contract.buyer.email}</p>
                        </div>
                        {contract.buyer.phoneNumber && (
                            <div>
                                <p className="text-sm text-slate-500">โทรศัพท์</p>
                                <p className="font-medium">{contract.buyer.phoneNumber}</p>
                            </div>
                        )}
                        {contract.buyer.profile?.address && (
                            <div>
                                <p className="text-sm text-slate-500">ที่อยู่</p>
                                <p className="font-medium">{contract.buyer.profile.address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cultivation Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="text-emerald-600" size={18} />
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
                        <div>
                            <p className="text-sm text-slate-500">วันเริ่มปลูก</p>
                            <p className="font-medium">{formatDate(contract.cultivation.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">คาดเก็บเกี่ยว</p>
                            <p className="font-medium">{formatDate(contract.cultivation.expectedHarvestDate)}</p>
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
                            เงื่อนไขเพิ่มเติม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-300 whitespace-pre-wrap">
                            {contract.buyRequest.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Sign Confirmation Modal */}
            <ConfirmModal
                isOpen={showSignModal}
                onClose={() => setShowSignModal(false)}
                onConfirm={() => updateContractStatus('SIGNED')}
                title="ยืนยันการลงนามสัญญา"
                message={`คุณกำลังจะลงนามสัญญาขาย ${contract.cultivation.product.name} จำนวน ${Number(contract.agreedQuantity).toLocaleString()} กก. ในราคา ${formatMoney(Number(contract.agreedPrice))}/กก. มูลค่ารวม ${formatMoney(totalValue)}`}
                confirmText="ลงนามสัญญา"
                variant="default"
                isLoading={isUpdating}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => updateContractStatus('CANCELLED')}
                title="ปฏิเสธสัญญา"
                message="คุณแน่ใจหรือไม่ที่จะปฏิเสธสัญญานี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
                confirmText="ปฏิเสธ"
                variant="danger"
                isLoading={isUpdating}
            />
        </div>
    );
}
