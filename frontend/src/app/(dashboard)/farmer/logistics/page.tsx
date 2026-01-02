'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Truck,
    Search,
    MapPin,
    Package,
    Calendar,
    Clock,
    Filter,
    Plus,
    ChevronRight,
    Users,
    DollarSign,
    CheckCircle2,
    XCircle,
    Loader2,
    Car,
    Tractor,
    Box
} from 'lucide-react';
import Link from 'next/link';

type VehicleType = 'PICKUP_TRUCK' | 'LORRY' | 'TRACTOR' | 'REFRIGERATED' | 'FLATBED';
type TransportStatus = 'OPEN' | 'MATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

interface TransportVehicle {
    id: string;
    vehicleType: VehicleType;
    capacity: number;
    description: string | null;
    licensePlate: string | null;
    basePricePerKm: number;
    locationLat: number;
    locationLng: number;
    isAvailable: boolean;
    owner: {
        id: string;
        username: string;
        phoneNumber: string | null;
        profile: {
            fullName: string | null;
            avatarUrl: string | null;
        } | null;
    };
    distance?: number;
}

interface TransportRequest {
    id: string;
    pickupAddress: string | null;
    dropoffAddress: string | null;
    cargoType: string;
    cargoWeight: number;
    requestedDate: string;
    status: TransportStatus;
    priceOffered: number | null;
    isShareable: boolean;
    vehicle: any | null;
}

const vehicleTypes: { id: VehicleType; label: string; icon: React.ElementType }[] = [
    { id: 'PICKUP_TRUCK', label: 'กระบะ', icon: Car },
    { id: 'LORRY', label: 'รถบรรทุก', icon: Truck },
    { id: 'TRACTOR', label: 'รถแทรกเตอร์', icon: Tractor },
    { id: 'REFRIGERATED', label: 'รถห้องเย็น', icon: Box },
    { id: 'FLATBED', label: 'รถพ่วง', icon: Truck },
];

const statusColors: Record<TransportStatus, string> = {
    OPEN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MATCHED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    IN_TRANSIT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    COMPLETED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const statusLabels: Record<TransportStatus, string> = {
    OPEN: 'รอรับงาน',
    MATCHED: 'จับคู่แล้ว',
    IN_TRANSIT: 'กำลังขนส่ง',
    COMPLETED: 'เสร็จสิ้น',
    CANCELLED: 'ยกเลิก',
};

export default function LogisticsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'vehicles' | 'requests'>('vehicles');
    const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
    const [requests, setRequests] = useState<TransportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<VehicleType | ''>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch vehicles
    const fetchVehicles = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedType) params.append('type', selectedType);

            const res = await fetch(`/api/transport/vehicles?${params}`);
            const data = await res.json();
            // Ensure data is an array before setting state
            setVehicles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setVehicles([]);
        }
    };

    // Fetch user's requests
    const fetchRequests = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/transport/requests?farmerId=${session.user.id}`);
            const data = await res.json();
            // Ensure data is an array before setting state
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setRequests([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'vehicles') {
            fetchVehicles().finally(() => setLoading(false));
        } else {
            fetchRequests().finally(() => setLoading(false));
        }
    }, [activeTab, selectedType, session?.user?.id]);

    const getVehicleIcon = (type: VehicleType) => {
        const found = vehicleTypes.find(v => v.id === type);
        return found ? found.icon : Truck;
    };

    const getVehicleLabel = (type: VehicleType) => {
        const found = vehicleTypes.find(v => v.id === type);
        return found ? found.label : type;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Truck className="text-white" size={22} />
                        </div>
                        ขนส่งสินค้าเกษตร
                    </h1>
                    <p className="text-slate-400 mt-1">ค้นหารถขนส่งและจัดการการขนส่งสินค้า</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/farmer/logistics/share"
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
                    >
                        <Users size={18} />
                        ร่วมขนส่ง
                    </Link>
                    <Link
                        href="/farmer/logistics/my-vehicles"
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
                    >
                        <Plus size={18} />
                        รถของฉัน
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-0">
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`px-4 py-3 font-medium transition-all border-b-2 -mb-px ${activeTab === 'vehicles'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Truck size={18} />
                        ค้นหารถขนส่ง
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium transition-all border-b-2 -mb-px ${activeTab === 'requests'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Package size={18} />
                        คำขอของฉัน
                    </div>
                </button>
            </div>

            {activeTab === 'vehicles' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="ค้นหาตำแหน่ง..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as VehicleType | '')}
                            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">ประเภทรถทั้งหมด</option>
                            {vehicleTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicles Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-20">
                            <Truck className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">ไม่พบรถขนส่งที่พร้อมให้บริการในขณะนี้</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vehicles.map((vehicle) => {
                                const VehicleIcon = getVehicleIcon(vehicle.vehicleType);
                                return (
                                    <div
                                        key={vehicle.id}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                                                <VehicleIcon className="text-amber-400" size={28} />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                    {getVehicleLabel(vehicle.vehicleType)}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    {vehicle.owner.profile?.fullName || vehicle.owner.username}
                                                </p>
                                            </div>
                                            {vehicle.isAvailable && (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                                    พร้อมบริการ
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Package size={14} />
                                                <span>ความจุ: {Number(vehicle.capacity).toLocaleString()} ตัน</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <DollarSign size={14} />
                                                <span>฿{Number(vehicle.basePricePerKm).toLocaleString()}/กม.</span>
                                            </div>
                                            {vehicle.distance !== undefined && (
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <MapPin size={14} />
                                                    <span>ห่าง {vehicle.distance} กม.</span>
                                                </div>
                                            )}
                                            {vehicle.licensePlate && (
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Car size={14} />
                                                    <span>{vehicle.licensePlate}</span>
                                                </div>
                                            )}
                                        </div>

                                        {vehicle.description && (
                                            <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                                                {vehicle.description}
                                            </p>
                                        )}

                                        <button className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all">
                                            ติดต่อขอใช้บริการ
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'requests' && (
                <>
                    {/* Create Request Button */}
                    <div className="flex justify-end">
                        <CreateRequestButton onCreated={fetchRequests} />
                    </div>

                    {/* Requests List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีคำขอขนส่ง</p>
                            <p className="text-slate-500 text-sm mt-1">สร้างคำขอขนส่งเพื่อหารถขนสินค้า</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                                                <Package className="text-blue-400" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{request.cargoType}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {Number(request.cargoWeight).toLocaleString()} ตัน
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {request.isShareable && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                                                    <Users size={12} className="inline mr-1" />
                                                    ร่วมขนส่ง
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[request.status]}`}>
                                                {statusLabels[request.status]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                                            <span>วันที่: {new Date(request.requestedDate).toLocaleDateString('th-TH')}</span>
                                        </div>
                                        {request.priceOffered && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <DollarSign size={14} />
                                                <span>เสนอราคา: ฿{Number(request.priceOffered).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {request.vehicle && (
                                        <div className="mt-4 p-3 bg-slate-800/50 rounded-xl">
                                            <p className="text-sm text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 size={14} />
                                                รถ: {request.vehicle.licensePlate} ({request.vehicle.owner.profile?.fullName || request.vehicle.owner.username})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Create Request Modal Component
function CreateRequestButton({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        pickupAddress: '',
        pickupLat: 13.7563,
        pickupLng: 100.5018,
        dropoffAddress: '',
        dropoffLat: 13.8,
        dropoffLng: 100.6,
        cargoType: '',
        cargoWeight: '',
        requestedDate: '',
        priceOffered: '',
        notes: '',
        isShareable: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/transport/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    cargoWeight: parseFloat(form.cargoWeight),
                    priceOffered: form.priceOffered ? parseFloat(form.priceOffered) : null,
                }),
            });
            if (res.ok) {
                setOpen(false);
                setForm({
                    pickupAddress: '',
                    pickupLat: 13.7563,
                    pickupLng: 100.5018,
                    dropoffAddress: '',
                    dropoffLat: 13.8,
                    dropoffLng: 100.6,
                    cargoType: '',
                    cargoWeight: '',
                    requestedDate: '',
                    priceOffered: '',
                    notes: '',
                    isShareable: false,
                });
                onCreated();
            }
        } catch (error) {
            console.error('Error creating request:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
            >
                <Plus size={18} />
                สร้างคำขอขนส่ง
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="text-blue-400" size={24} />
                    สร้างคำขอขนส่ง
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทสินค้า</label>
                        <input
                            type="text"
                            required
                            placeholder="เช่น ผัก, ข้าว, ผลไม้"
                            value={form.cargoType}
                            onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">น้ำหนัก (ตัน)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={form.cargoWeight}
                                onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">วันที่ต้องการ</label>
                            <input
                                type="date"
                                required
                                value={form.requestedDate}
                                onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ที่อยู่รับสินค้า</label>
                        <input
                            type="text"
                            placeholder="เช่น ตำบล อำเภอ จังหวัด"
                            value={form.pickupAddress}
                            onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ที่อยู่ส่งสินค้า</label>
                        <input
                            type="text"
                            placeholder="เช่น ตลาด ตำบล อำเภอ จังหวัด"
                            value={form.dropoffAddress}
                            onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ราคาที่ต้องการ (บาท)</label>
                        <input
                            type="number"
                            placeholder="ไม่บังคับ"
                            value={form.priceOffered}
                            onChange={(e) => setForm({ ...form, priceOffered: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="shareable"
                            checked={form.isShareable}
                            onChange={(e) => setForm({ ...form, isShareable: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                        />
                        <label htmlFor="shareable" className="text-slate-300">
                            <span className="flex items-center gap-2">
                                <Users size={16} className="text-purple-400" />
                                อนุญาตให้ร่วมขนส่งกับคนอื่น (ลดค่าใช้จ่าย)
                            </span>
                        </label>
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
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            สร้างคำขอ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
