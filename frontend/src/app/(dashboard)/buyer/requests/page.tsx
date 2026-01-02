'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import {
    ShoppingCart,
    Plus,
    Calendar,
    Users,
    Filter,
} from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/utils';

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
    };
    product: {
        id: number;
        name: string;
    };
    contracts: { id: string; status: string }[];
}

const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'OPEN', label: 'เปิดรับ' },
    { value: 'CLOSED', label: 'ปิดแล้ว' },
    { value: 'FULFILLED', label: 'ครบถ้วน' },
];

export default function BuyRequestsPage() {
    const [requests, setRequests] = useState<BuyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const fetchRequests = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/buy-requests?${params.toString()}`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching buy requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isExpired = (date: string) => new Date(date) < new Date();

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
                    <h1 className="text-2xl font-bold text-white">ประกาศรับซื้อของฉัน</h1>
                    <p className="text-slate-400 mt-1">
                        จัดการประกาศรับซื้อทั้งหมด {requests.length} รายการ
                    </p>
                </div>
                <Link href="/buyer/requests/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        ประกาศรับซื้อใหม่
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

            {/* Requests List */}
            {requests.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        ยังไม่มีประกาศรับซื้อ
                    </h3>
                    <p className="text-slate-400 mb-4">
                        สร้างประกาศรับซื้อเพื่อหาเกษตรกรที่ต้องการ
                    </p>
                    <Link href="/buyer/requests/new">
                        <Button className="gap-2">
                            <Plus size={18} />
                            ประกาศรับซื้อใหม่
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <Link
                            key={req.id}
                            href={`/buyer/requests/${req.id}`}
                            className="block"
                        >
                            <Card className="hover:shadow-md transition group">
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Left: Product Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">
                                                    🌾
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition">
                                                        {req.product.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        ต้องการ {Number(req.quantityRequired).toLocaleString()} กก.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                {req.priceOffered && (
                                                    <span className="text-emerald-600 font-medium">
                                                        {formatMoney(Number(req.priceOffered))}/กก.
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    หมดอายุ: {formatDate(req.expiryDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Status & Responses */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={req.status} type="demand" />
                                                {isExpired(req.expiryDate) && req.status === 'OPEN' && (
                                                    <span className="text-xs text-rose-500">หมดอายุแล้ว</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Users size={14} />
                                                {req.contracts.length} ข้อเสนอ
                                            </div>
                                        </div>
                                    </div>

                                    {req.description && (
                                        <p className="mt-3 text-sm text-slate-400 line-clamp-2 border-t border-slate-700 pt-3">
                                            {req.description}
                                        </p>
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
