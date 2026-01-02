'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Truck,
    Plus,
    MapPin,
    Package,
    DollarSign,
    Settings,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    ArrowLeft,
    Car,
    Tractor,
    Box,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

type VehicleType = 'PICKUP_TRUCK' | 'LORRY' | 'TRACTOR' | 'REFRIGERATED' | 'FLATBED';

interface TransportVehicle {
    id: string;
    vehicleType: VehicleType;
    capacity: number;
    description: string | null;
    licensePlate: string | null;
    basePricePerKm: number;
    locationLat: number;
    locationLng: number;
    serviceRadius: number;
    isAvailable: boolean;
    imageUrl: string | null;
    _count: {
        transportRequests: number;
    };
}

const vehicleTypes: { id: VehicleType; label: string; icon: React.ElementType }[] = [
    { id: 'PICKUP_TRUCK', label: 'รถกระบะ', icon: Car },
    { id: 'LORRY', label: 'รถบรรทุก', icon: Truck },
    { id: 'TRACTOR', label: 'รถแทรกเตอร์', icon: Tractor },
    { id: 'REFRIGERATED', label: 'รถห้องเย็น', icon: Box },
    { id: 'FLATBED', label: 'รถพ่วง', icon: Truck },
];

export default function MyVehiclesPage() {
    const { data: session } = useSession();
    const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchVehicles = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/transport/vehicles?ownerId=${session.user.id}`);
            const data = await res.json();
            setVehicles(data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchVehicles();
        }
    }, [session?.user?.id]);

    const toggleAvailability = async (vehicle: TransportVehicle) => {
        setUpdating(vehicle.id);
        try {
            const res = await fetch(`/api/transport/vehicles/${vehicle.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !vehicle.isAvailable }),
            });
            if (res.ok) {
                setVehicles(vehicles.map(v =>
                    v.id === vehicle.id ? { ...v, isAvailable: !v.isAvailable } : v
                ));
            }
        } catch (error) {
            console.error('Error updating vehicle:', error);
        } finally {
            setUpdating(null);
        }
    };

    const deleteVehicle = async (id: string) => {
        if (!confirm('ต้องการลบรถคันนี้หรือไม่?')) return;
        try {
            const res = await fetch(`/api/transport/vehicles/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setVehicles(vehicles.filter(v => v.id !== id));
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    };

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
            <div className="flex items-center gap-4">
                <Link
                    href="/farmer/logistics"
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-400" />
                </Link>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Truck className="text-white" size={22} />
                        </div>
                        รถขนส่งของฉัน
                    </h1>
                    <p className="text-slate-400 mt-1">จัดการรถขนส่งที่คุณลงทะเบียนไว้</p>
                </div>
                <AddVehicleButton onAdded={fetchVehicles} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Truck className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{vehicles.length}</p>
                            <p className="text-sm text-slate-400">รถทั้งหมด</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {vehicles.filter(v => v.isAvailable).length}
                            </p>
                            <p className="text-sm text-slate-400">พร้อมให้บริการ</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Package className="text-amber-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {vehicles.reduce((sum, v) => sum + v._count.transportRequests, 0)}
                            </p>
                            <p className="text-sm text-slate-400">งานทั้งหมด</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                    <Truck className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-400 mb-2">คุณยังไม่มีรถลงทะเบียน</p>
                    <p className="text-slate-500 text-sm">ลงทะเบียนรถของคุณเพื่อรับงานขนส่ง</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vehicles.map((vehicle) => {
                        const VehicleIcon = getVehicleIcon(vehicle.vehicleType);
                        return (
                            <div
                                key={vehicle.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                                        <VehicleIcon className="text-amber-400" size={32} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">
                                                    {getVehicleLabel(vehicle.vehicleType)}
                                                </h3>
                                                {vehicle.licensePlate && (
                                                    <p className="text-slate-400 text-sm">{vehicle.licensePlate}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleAvailability(vehicle)}
                                                    disabled={updating === vehicle.id}
                                                    className={`p-2 rounded-lg transition-all ${vehicle.isAvailable
                                                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30'
                                                            : 'bg-slate-700 hover:bg-slate-600'
                                                        }`}
                                                    title={vehicle.isAvailable ? 'ปิดให้บริการ' : 'เปิดให้บริการ'}
                                                >
                                                    {updating === vehicle.id ? (
                                                        <Loader2 className="animate-spin text-slate-400" size={20} />
                                                    ) : vehicle.isAvailable ? (
                                                        <ToggleRight className="text-emerald-400" size={20} />
                                                    ) : (
                                                        <ToggleLeft className="text-slate-400" size={20} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteVehicle(vehicle.id)}
                                                    className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 transition-all"
                                                    title="ลบรถ"
                                                >
                                                    <Trash2 className="text-rose-400" size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Package size={14} />
                                                <span>ความจุ: {Number(vehicle.capacity).toLocaleString()} ตัน</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <DollarSign size={14} />
                                                <span>฿{Number(vehicle.basePricePerKm).toLocaleString()}/กม.</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={14} />
                                                <span>รัศมี {vehicle.serviceRadius} กม.</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Package size={14} />
                                                <span>{vehicle._count.transportRequests} งาน</span>
                                            </div>
                                        </div>

                                        {vehicle.description && (
                                            <p className="mt-3 text-slate-500 text-sm">{vehicle.description}</p>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                                            {vehicle.isAvailable ? (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                                    พร้อมรับงาน
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full border border-slate-500/30">
                                                    ปิดให้บริการ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Add Vehicle Modal Component
function AddVehicleButton({ onAdded }: { onAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        vehicleType: 'PICKUP_TRUCK' as VehicleType,
        capacity: '',
        licensePlate: '',
        description: '',
        basePricePerKm: '',
        locationLat: 13.7563,
        locationLng: 100.5018,
        serviceRadius: 50,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/transport/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    capacity: parseFloat(form.capacity),
                    basePricePerKm: parseFloat(form.basePricePerKm),
                }),
            });
            if (res.ok) {
                setOpen(false);
                setForm({
                    vehicleType: 'PICKUP_TRUCK',
                    capacity: '',
                    licensePlate: '',
                    description: '',
                    basePricePerKm: '',
                    locationLat: 13.7563,
                    locationLng: 100.5018,
                    serviceRadius: 50,
                });
                onAdded();
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
            >
                <Plus size={18} />
                เพิ่มรถ
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Truck className="text-emerald-400" size={24} />
                            ลงทะเบียนรถขนส่ง
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทรถ</label>
                                <select
                                    value={form.vehicleType}
                                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                >
                                    {vehicleTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">ความจุ (ตัน)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={form.capacity}
                                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">ทะเบียนรถ</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น กข 1234"
                                        value={form.licensePlate}
                                        onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">ราคาต่อกม. (บาท)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.basePricePerKm}
                                        onChange={(e) => setForm({ ...form, basePricePerKm: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">รัศมีให้บริการ (กม.)</label>
                                    <input
                                        type="number"
                                        value={form.serviceRadius}
                                        onChange={(e) => setForm({ ...form, serviceRadius: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">รายละเอียดเพิ่มเติม</label>
                                <textarea
                                    rows={2}
                                    placeholder="เช่น มีผ้าใบกันฝน, พร้อมคนขับ"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                                />
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
                                    ลงทะเบียน
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
