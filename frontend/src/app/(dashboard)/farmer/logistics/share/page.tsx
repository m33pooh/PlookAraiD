'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    Truck,
    MapPin,
    Calendar,
    Package,
    DollarSign,
    ChevronRight,
    Plus,
    Loader2,
    ArrowLeft,
    Search,
    Route,
    Clock
} from 'lucide-react';
import Link from 'next/link';

type VehicleType = 'PICKUP_TRUCK' | 'LORRY' | 'TRACTOR' | 'REFRIGERATED' | 'FLATBED';

interface TransportRoute {
    id: string;
    driverId: string;
    vehicleType: VehicleType;
    routeDate: string;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    availableCapacity: number;
    pricePerKm: number;
    status: string;
    driver: {
        id: string;
        username: string;
        phoneNumber: string | null;
        profile: {
            fullName: string | null;
            avatarUrl: string | null;
        } | null;
    };
    participants: any[];
    remainingCapacity: number;
    participantCount: number;
}

interface ShareableRequest {
    id: string;
    cargoType: string;
    cargoWeight: number;
    pickupAddress: string | null;
    dropoffAddress: string | null;
    requestedDate: string;
    farmer: {
        id: string;
        username: string;
        profile: {
            fullName: string | null;
        } | null;
    };
}

const vehicleLabels: Record<VehicleType, string> = {
    PICKUP_TRUCK: 'กระบะ',
    LORRY: 'รถบรรทุก',
    TRACTOR: 'รถแทรกเตอร์',
    REFRIGERATED: 'รถห้องเย็น',
    FLATBED: 'รถพ่วง',
};

export default function ShareTransportPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'routes' | 'requests'>('routes');
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [shareableRequests, setShareableRequests] = useState<ShareableRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    // Fetch available routes
    const fetchRoutes = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedDate) params.append('date', selectedDate);

            const res = await fetch(`/api/transport/routes?${params}`);
            const data = await res.json();
            setRoutes(data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    // Fetch shareable requests
    const fetchShareableRequests = async () => {
        try {
            const res = await fetch('/api/transport/requests?shareable=true');
            const data = await res.json();
            setShareableRequests(data);
        } catch (error) {
            console.error('Error fetching shareable requests:', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'routes') {
            fetchRoutes().finally(() => setLoading(false));
        } else {
            fetchShareableRequests().finally(() => setLoading(false));
        }
    }, [activeTab, selectedDate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/farmer/logistics"
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Users className="text-white" size={22} />
                        </div>
                        ร่วมขนส่งสินค้า
                    </h1>
                    <p className="text-slate-400 mt-1">ร่วมเดินทางกับรถที่มีพื้นที่ว่างเพื่อลดค่าใช้จ่าย</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/30 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-1">ร่วมขนส่งคืออะไร?</h3>
                        <p className="text-slate-300 text-sm">
                            ระบบที่ช่วยให้คุณสามารถร่วมใช้รถขนส่งกับเกษตรกรคนอื่นที่มีเส้นทางใกล้เคียงกัน
                            ช่วยประหยัดค่าขนส่งและลดผลกระทบต่อสิ่งแวดล้อม
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-0">
                <button
                    onClick={() => setActiveTab('routes')}
                    className={`px-4 py-3 font-medium transition-all border-b-2 -mb-px ${activeTab === 'routes'
                            ? 'text-purple-400 border-purple-400'
                            : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Route size={18} />
                        เส้นทางที่เปิดรับ
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium transition-all border-b-2 -mb-px ${activeTab === 'requests'
                            ? 'text-purple-400 border-purple-400'
                            : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Package size={18} />
                        คนที่ต้องการร่วมขนส่ง
                    </div>
                </button>
            </div>

            {activeTab === 'routes' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">กรองตามวันที่</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <CreateRouteButton onCreated={fetchRoutes} />
                    </div>

                    {/* Routes List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-purple-500" size={40} />
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-20">
                            <Route className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีเส้นทางที่เปิดรับร่วมขนส่ง</p>
                            <p className="text-slate-500 text-sm mt-1">สร้างเส้นทางใหม่หากคุณมีรถและต้องการรับสินค้าร่วมเดินทาง</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {routes.map((route) => (
                                <div
                                    key={route.id}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                                                <Truck className="text-purple-400" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {vehicleLabels[route.vehicleType]}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    โดย {route.driver.profile?.fullName || route.driver.username}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-emerald-400">
                                                ฿{Number(route.pricePerKm).toLocaleString()}/กม.
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                เหลือ {route.remainingCapacity.toFixed(1)} ตัน
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span>{new Date(route.routeDate).toLocaleDateString('th-TH', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Package size={14} />
                                            <span>ความจุรวม: {Number(route.availableCapacity).toLocaleString()} ตัน</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Users size={14} />
                                            <span>{route.participantCount} คนร่วมเดินทาง</span>
                                        </div>
                                    </div>

                                    {/* Capacity Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">พื้นที่ใช้ไป</span>
                                            <span className="text-slate-300">
                                                {(Number(route.availableCapacity) - route.remainingCapacity).toFixed(1)} / {Number(route.availableCapacity)} ตัน
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                style={{
                                                    width: `${((Number(route.availableCapacity) - route.remainingCapacity) / Number(route.availableCapacity)) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {route.remainingCapacity > 0 && (
                                        <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all">
                                            ขอร่วมเดินทาง
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'requests' && (
                <>
                    {/* Shareable Requests List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-purple-500" size={40} />
                        </div>
                    ) : shareableRequests.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีคนต้องการร่วมขนส่ง</p>
                            <p className="text-slate-500 text-sm mt-1">สร้างคำขอขนส่งและเลือก "อนุญาตให้ร่วมขนส่ง" เพื่อให้คนอื่นเห็น</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shareableRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                                >
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                                            <Package className="text-blue-400" size={24} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-white">{request.cargoType}</h3>
                                            <p className="text-sm text-slate-400">
                                                {request.farmer.profile?.fullName || request.farmer.username}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">
                                                {Number(request.cargoWeight).toLocaleString()} ตัน
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={14} className="text-emerald-400" />
                                            <span>จาก: {request.pickupAddress || 'ไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={14} className="text-rose-400" />
                                            <span>ถึง: {request.dropoffAddress || 'ไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span>{new Date(request.requestedDate).toLocaleDateString('th-TH')}</span>
                                        </div>
                                    </div>

                                    <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-all">
                                        ติดต่อเพื่อร่วมขนส่ง
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Create Route Modal Component
function CreateRouteButton({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        vehicleType: 'PICKUP_TRUCK' as VehicleType,
        routeDate: '',
        startLat: 13.7563,
        startLng: 100.5018,
        endLat: 14.0,
        endLng: 100.5,
        availableCapacity: '',
        pricePerKm: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/transport/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    availableCapacity: parseFloat(form.availableCapacity),
                    pricePerKm: parseFloat(form.pricePerKm),
                }),
            });
            if (res.ok) {
                setOpen(false);
                setForm({
                    vehicleType: 'PICKUP_TRUCK',
                    routeDate: '',
                    startLat: 13.7563,
                    startLng: 100.5018,
                    endLat: 14.0,
                    endLng: 100.5,
                    availableCapacity: '',
                    pricePerKm: '',
                });
                onCreated();
            }
        } catch (error) {
            console.error('Error creating route:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
            >
                <Plus size={18} />
                สร้างเส้นทาง
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Route className="text-purple-400" size={24} />
                            สร้างเส้นทางร่วมขนส่ง
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทรถ</label>
                                <select
                                    value={form.vehicleType}
                                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    {Object.entries(vehicleLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">วันที่เดินทาง</label>
                                <input
                                    type="date"
                                    required
                                    value={form.routeDate}
                                    onChange={(e) => setForm({ ...form, routeDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">ความจุที่เปิดรับ (ตัน)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={form.availableCapacity}
                                        onChange={(e) => setForm({ ...form, availableCapacity: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">ราคาต่อกม. (บาท)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.pricePerKm}
                                        onChange={(e) => setForm({ ...form, pricePerKm: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    สร้างเส้นทาง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
