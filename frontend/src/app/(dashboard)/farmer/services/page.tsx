
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Search,
    MapPin,
    Star,
    Filter,
    Tractor,
    Sprout,
    Users,
    CheckCircle2,
    Calendar,
    Clock,
    ClipboardList,
    Map,
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
    Modal
} from "@/components/ui/Modal"
import { Textarea } from "@/components/ui/Textarea"
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Dynamic import MapView to avoid SSR issues
const MapView = dynamic(
    () => import('@/components/ui/map/map-view'),
    { ssr: false, loading: () => <div className="h-[400px] bg-slate-800 rounded-xl animate-pulse" /> }
);

// Mock categories for UI (consistent with backend enum)
const categories = [
    { id: 'All', label: 'ทั้งหมด', icon: Filter },
    { id: 'HARVESTING', label: 'เก็บเกี่ยว', icon: Tractor },
    { id: 'DRONE_SPRAYING', label: 'โดรนพ่นยา', icon: Sprout },
    { id: 'PLOUGHING', label: 'เตรียมดิน/ไถ', icon: Sprout },
    { id: 'LABOR', label: 'แรงงาน', icon: Users },
    { id: 'TRANSPORTATION', label: 'ขนส่ง', icon: Tractor },
];

export default function ServicesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingService, setBookingService] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && cat !== selectedCategory) {
            setSelectedCategory(cat);
        }

        const keyword = searchParams.get('keyword');
        if (keyword) {
            setSearchQuery(keyword);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchServices();
    }, [selectedCategory]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'All') {
                params.append('category', selectedCategory);
            }
            const res = await fetch(`/api/services?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredServices = services.filter(service => {
        return service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.provider.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">บริการสนับสนุน (Service Marketplace)</h1>
                    <p className="text-slate-400">ค้นหาและจ้างงานบริการทางการเกษตร เชื่อมต่อกับผู้ให้บริการมืออาชีพ</p>
                </div>
                <Link href="/farmer/services/bookings">
                    <Button variant="outline" className="gap-2">
                        <ClipboardList size={16} />
                        รายการจองของฉัน
                    </Button>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Categories */}
                <div className="flex overflow-x-auto pb-2 gap-2 w-full md:w-auto hidescroll">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${isSelected
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input
                        placeholder="ค้นหาชื่อบริการ, ผู้ให้บริการ..."
                        className="pl-10 bg-slate-900 border-slate-700 text-slate-200 focus:border-emerald-500"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <List size={16} />
                        <span className="hidden md:inline">รายการ</span>
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'map' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Map size={16} />
                        <span className="hidden md:inline">แผนที่</span>
                    </button>
                </div>
            </div>

            {/* Service Grid or Map */}
            {loading ? (
                <div className="text-white text-center py-10">Loading services...</div>
            ) : viewMode === 'map' ? (
                <div className="rounded-2xl overflow-hidden">
                    <MapView
                        markers={filteredServices
                            .filter(s => s.locationLat && s.locationLng)
                            .map(service => ({
                                id: service.id,
                                lat: parseFloat(service.locationLat),
                                lng: parseFloat(service.locationLng),
                                label: service.title,
                                popupContent: (
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-slate-900 mb-1">{service.title}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{service.provider?.profile?.fullName || service.provider?.username}</p>
                                        <p className="text-sm font-semibold text-emerald-600">฿{Number(service.price).toLocaleString()} / {service.priceUnit}</p>
                                        <button
                                            onClick={() => setBookingService(service)}
                                            className="mt-2 w-full bg-emerald-600 text-white text-sm py-1.5 rounded hover:bg-emerald-500 transition"
                                        >
                                            จองคิว
                                        </button>
                                    </div>
                                )
                            }))
                        }
                        height="500px"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 transition duration-300 flex flex-col"
                        >
                            {/* Image Cover */}
                            <div className="h-48 overflow-hidden relative bg-slate-900">
                                {service.imageUrl ? (
                                    <img
                                        src={service.imageUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <Tractor size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <Badge className={`${service.isAvailable ? 'bg-emerald-500/90 hover:bg-emerald-500' : 'bg-red-500/90 hover:bg-red-500'} text-white border-0 backdrop-blur-sm`}>
                                        {service.isAvailable ? 'ว่างพร้อมบริการ' : 'ไม่ว่าง'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">{service.title}</h3>
                                        <p className="text-sm text-slate-400">{service.provider?.profile?.fullName || service.provider?.username}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded text-amber-500 text-xs font-bold">
                                        <Star size={12} fill="currentColor" />
                                        <span>4.8</span>
                                        <span className="text-amber-500/50">(12)</span>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{service.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-slate-400">
                                        <MapPin size={16} className="mr-2 text-slate-500" />
                                        <span className="truncate">รัศมีบริการ {service.serviceRadius} กม.</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between items-center">
                                    <div>
                                        <span className="text-2xl font-bold text-white">฿{Number(service.price).toLocaleString()}</span>
                                        <span className="text-sm text-slate-500"> / {service.priceUnit}</span>
                                    </div>
                                    <Button
                                        disabled={!service.isAvailable}
                                        onClick={() => setBookingService(service)}
                                        className={`
                                        ${service.isAvailable ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 text-slate-400 cursor-not-allowed'} 
                                        text-white px-6
                                    `}>
                                        จองคิว
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredServices.length === 0 && (
                <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                    <Tractor size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">ไม่พบผู้ให้บริการที่คุณค้นหา</h3>
                    <p className="text-slate-500">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูสิ</p>
                </div>
            )}

            {/* Booking Modal */}
            <BookingDialog
                open={!!bookingService}
                onOpenChange={(open) => !open && setBookingService(null)}
                service={bookingService}
                cultivationId={searchParams.get('cultivationId')}
                prefilledDate={searchParams.get('date')}
            />
        </div>
    );
}

function BookingDialog({ open, onOpenChange, service, cultivationId, prefilledDate }: { open: boolean, onOpenChange: (o: boolean) => void, service: any, cultivationId: string | null, prefilledDate: string | null }) {
    const [date, setDate] = useState(prefilledDate || '');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (prefilledDate) {
            setDate(prefilledDate);
        }
    }, [prefilledDate]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!date) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/services/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    bookingDate: date,
                    notes,
                    cultivationId: cultivationId // Pass cultivationId if present
                })
            });
            if (res.ok) {
                onOpenChange(false);
                router.push('/farmer/services/bookings'); // Use absolute path
            } else {
                alert('Booking failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!service) return null;

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title={`จองบริการ: ${service.title}`}
            description={`ผู้ให้บริการ: ${service.provider?.profile?.fullName}`}
        >
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">
                        วันที่ต้องการรับบริการ
                    </label>
                    <Input
                        id="date"
                        type="date"
                        className="bg-slate-800 border-slate-700"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">
                        รายละเอียดเพิ่มเติม/พิกัดแปลง
                    </label>
                    <Textarea
                        id="notes"
                        placeholder="ระบุสิ่งที่ต้องการเพิ่มเติม หรือสถานที่นัดหมาย..."
                        className="bg-slate-800 border-slate-700"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-400">ค่าบริการเบื้องต้น</span>
                        <span>฿{Number(service.price).toLocaleString()} / {service.priceUnit}</span>
                    </div>
                    <p className="text-xs text-slate-500">*ราคาอาจะมีการเปลี่ยนแปลงตามขนาดพื้นที่จริงหรือระยะทาง</p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>ยกเลิก</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleSubmit} disabled={isSubmitting || !date}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'ยันยันการจอง'}
                </Button>
            </div>
        </Modal>
    )
}
