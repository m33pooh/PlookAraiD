
'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Tractor,
    MapPin,
    Phone,
    User,
    Calendar,
    AlertCircle,
    Truck,
    CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Booking {
    id: string;
    bookingDate: string;
    status: string;
    notes: string;
    farmer: {
        id: string;
        username: string;
        profile: {
            fullName: string;
        };
    };
    service: {
        title: string;
        price: number;
        priceUnit: string;
    };
}

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    'PENDING': { label: 'รอยืนยัน', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
    'ACCEPTED': { label: 'รับงานแล้ว', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
    'ON_THE_WAY': { label: 'กำลังเดินทาง', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Truck },
    'IN_PROGRESS': { label: 'กำลังทำงาน', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: Tractor },
    'COMPLETED': { label: 'เสร็จสิ้น', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckSquare },
    'CANCELLED': { label: 'ยกเลิกแล้ว', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: XCircle },
    'REJECTED': { label: 'ปฏิเสธแล้ว', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function ProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/services/bookings');
            if (res.ok) {
                const data = await res.json();
                // We might need to filter provider-specific bookings if the API returns both roles
                // Ideally API handles this based on user context, but let's assume API returns all relevant to user
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/services/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchBookings(); // Refresh
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading bookings...</div>;

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const activeBookings = bookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status));
    const historyBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">จัดการงานบริการ (Provider Dashboard)</h1>
                <p className="text-slate-400">จัดการคำขอจองคิวงานบริการของคุณ</p>
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" /> คำขอใหม่ที่รอการยืนยัน
                    </h2>
                    <div className="grid gap-4">
                        {pendingBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} onUpdateStatus={updateStatus} />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Jobs */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Tractor className="text-blue-500" /> งานที่กำลังดำเนินการ
                </h2>
                {activeBookings.length === 0 ? (
                    <div className="text-slate-500 p-8 border border-slate-800 rounded-xl bg-slate-900/50 text-center">
                        ไม่มีงานที่กำลังดำเนินการขณะนี้
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} onUpdateStatus={updateStatus} />
                        ))}
                    </div>
                )}
            </div>

            {/* History */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="text-slate-500" /> ประวัติการทำงาน
                </h2>
                <div className="grid gap-4 opacity-75">
                    {historyBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} onUpdateStatus={updateStatus} isHistory />
                    ))}
                </div>
            </div>
        </div>
    );
}

function BookingCard({ booking, onUpdateStatus, isHistory = false }: { booking: Booking, onUpdateStatus: (id: string, status: string) => void, isHistory?: boolean }) {
    const statusInfo = statusMap[booking.status] || { label: booking.status, color: 'text-slate-500', icon: Clock };
    const StatusIcon = statusInfo.icon;

    return (
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 min-w-[100px]">
                    <span className="text-slate-400 text-sm">{format(new Date(booking.bookingDate), 'MMM yyyy', { locale: th })}</span>
                    <span className="text-3xl font-bold text-white">{format(new Date(booking.bookingDate), 'd')}</span>
                    <span className="text-slate-400 text-sm">{format(new Date(booking.bookingDate), 'EEEE', { locale: th })}</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-white">{booking.service.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                <User size={14} />
                                <span>ลูกค้า: {booking.farmer.profile?.fullName || booking.farmer.username}</span>
                            </div>
                        </div>
                        <Badge className={`${statusInfo.color} gap-1`}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                        </Badge>
                    </div>

                    {booking.notes && (
                        <div className="bg-slate-900/50 p-3 rounded-lg text-sm text-slate-300 border border-slate-700/30">
                            <span className="text-slate-500 mr-2">หมายเหตุ:</span>
                            {booking.notes}
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-400 pt-2">
                        <div className="flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">฿{Number(booking.service.price).toLocaleString()}</span>
                            <span>/ {booking.service.priceUnit}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!isHistory && (
                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                        {booking.status === 'PENDING' && (
                            <>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 w-full" onClick={() => onUpdateStatus(booking.id, 'ACCEPTED')}>
                                    รับงาน
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 w-full" onClick={() => onUpdateStatus(booking.id, 'REJECTED')}>
                                    ปฏิเสธ
                                </Button>
                            </>
                        )}
                        {booking.status === 'ACCEPTED' && (
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 w-full" onClick={() => onUpdateStatus(booking.id, 'ON_THE_WAY')}>
                                เริ่มออกเดินทาง
                            </Button>
                        )}
                        {booking.status === 'ON_THE_WAY' && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-500 w-full" onClick={() => onUpdateStatus(booking.id, 'IN_PROGRESS')}>
                                ถึงหน้างาน / เริ่มงาน
                            </Button>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 w-full" onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}>
                                งานเสร็จสิ้น
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
