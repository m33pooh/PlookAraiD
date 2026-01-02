'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import {
    FileText,
    Filter,
    Calendar,
    User,
    ArrowRight,
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
        profile: { fullName: string | null } | null;
    };
    buyer: {
        id: string;
        username: string;
        profile: { fullName: string | null } | null;
    };
    cultivation: {
        id: string;
        product: {
            id: number;
            name: string;
        };
        farm: {
            id: string;
            name: string;
        };
    };
}

const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'DRAFT', label: 'แบบร่าง' },
    { value: 'SIGNED', label: 'ลงนามแล้ว' },
    { value: 'COMPLETED', label: 'เสร็จสิ้น' },
    { value: 'CANCELLED', label: 'ยกเลิก' },
];

export default function FarmerContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchContracts();
    }, [statusFilter]);

    const fetchContracts = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            // In production, add farmerId filter from session

            const response = await fetch(`/api/contracts?${params.toString()}`);
            const data = await response.json();
            setContracts(data);
        } catch (error) {
            console.error('Error fetching contracts:', error);
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
            <div>
                <h1 className="text-2xl font-bold text-white">สัญญารับซื้อ</h1>
                <p className="text-slate-400 mt-1">
                    จัดการสัญญาทั้งหมด {contracts.length} ฉบับ
                </p>
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

            {/* Contracts List */}
            {contracts.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        ยังไม่มีสัญญา
                    </h3>
                    <p className="text-slate-400">
                        สัญญาจะปรากฏที่นี่เมื่อคุณตอบรับข้อเสนอจากผู้รับซื้อ
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contracts.map((contract) => (
                        <Link
                            key={contract.id}
                            href={`/farmer/contracts/${contract.id}`}
                            className="block"
                        >
                            <Card className="hover:shadow-md transition group">
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Left: Contract Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="text-blue-600" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition">
                                                        {contract.cultivation.product.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        {contract.cultivation.farm.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} />
                                                    ผู้รับซื้อ: {contract.buyer.profile?.fullName || contract.buyer.username}
                                                </span>
                                                {contract.signedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(contract.signedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Price & Status */}
                                        <div className="flex flex-col items-end gap-2">
                                            <StatusBadge status={contract.status} type="contract" />
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">
                                                    {formatMoney(Number(contract.agreedPrice))}/กก.
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {Number(contract.agreedQuantity).toLocaleString()} กก.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {contract.status === 'DRAFT' && (
                                        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                                            <span className="text-sm text-amber-600">
                                                ⚠️ รอการลงนาม
                                            </span>
                                            <span className="text-sm text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                ลงนามสัญญา <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
