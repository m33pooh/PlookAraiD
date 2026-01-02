
'use client';

import React, { useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/services/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'ACCEPTED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ON_THE_WAY': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'IN_PROGRESS': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'รอการตอบรับ';
            case 'ACCEPTED': return 'รับงานแล้ว';
            case 'ON_THE_WAY': return 'กำลังเดินทาง';
            case 'IN_PROGRESS': return 'กำลังดำเนินการ';
            case 'COMPLETED': return 'เสร็จสิ้น';
            case 'CANCELLED': return 'ยกเลิก';
            case 'REJECTED': return 'ปฏิเสธ';
            default: return status;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <Link href="/farmer/services" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition">
                    <ArrowLeft size={16} /> กลับไปหน้าบริการ
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">รายการจองของฉัน (My Bookings)</h1>
                <p className="text-slate-400">ติดตามสถานะการจองบริการทางการเกษตรของคุณ</p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading bookings...</div>
            ) : bookings.length === 0 ? (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-10 text-center">
                    <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">ยังไม่มีรายการจอง</h3>
                    <p className="text-slate-500 mb-6">คุณยังไม่ได้ทำการจองบริการใดๆ เริ่มต้นค้นหาบริการได้เลย</p>
                    <Link href="/farmer/services">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            ค้นหาบริการ
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-slate-600 transition">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-white">{booking.service.title}</h3>
                                    <Badge variant="outline" className={`${getStatusColor(booking.status)} border`}>
                                        {getStatusLabel(booking.status)}
                                    </Badge>
                                </div>
                                <div className="space-y-1 text-slate-400 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-500" />
                                        <span>ผู้ให้บริการ: {booking.service.provider.profile?.fullName || booking.service.provider.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500" />
                                        <span>วันที่รับบริการ: {format(new Date(booking.bookingDate), 'd MMMM yyyy', { locale: th })}</span>
                                    </div>
                                    {booking.notes && (
                                        <div className="mt-2 text-slate-500 bg-slate-900/50 p-2 rounded text-xs">
                                            Note: "{booking.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                <span className="text-xl font-bold text-white">฿{Number(booking.service.price).toLocaleString()}</span>
                                <span className="text-xs text-slate-500">ราคาประเมิน</span>
                                {booking.status === 'PENDING' && (
                                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-auto py-1 px-2 text-xs">
                                        ยกเลิกการจอง
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
