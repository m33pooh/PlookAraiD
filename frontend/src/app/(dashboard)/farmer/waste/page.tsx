'use client';

import React, { useState, useEffect } from 'react';
import {
    Recycle,
    Search,
    MapPin,
    Filter,
    Plus,
    Leaf,
    Package,
    Phone,
    Calendar,
    X,
    Truck,
    ChevronDown,
} from 'lucide-react';

const WASTE_CATEGORIES = [
    { id: 'RICE_STRAW', label: 'ฟางข้าว', icon: '🌾' },
    { id: 'CORN_COB', label: 'ซังข้าวโพด', icon: '🌽' },
    { id: 'SUGARCANE_LEAVES', label: 'ใบอ้อย', icon: '🎋' },
    { id: 'ANIMAL_MANURE', label: 'มูลสัตว์', icon: '🐄' },
    { id: 'FRUIT_WASTE', label: 'เศษผลไม้', icon: '🍎' },
    { id: 'VEGETABLE_WASTE', label: 'เศษผัก', icon: '🥬' },
    { id: 'OTHER', label: 'อื่นๆ', icon: '♻️' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'พร้อมขาย', color: 'bg-emerald-500' },
    RESERVED: { label: 'จองแล้ว', color: 'bg-amber-500' },
    SOLD: { label: 'ขายแล้ว', color: 'bg-slate-500' },
};

interface BiomassListing {
    id: string;
    category: string;
    title: string;
    description?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    locationLat: number;
    locationLng: number;
    locationName?: string;
    status: string;
    createdAt: string;
    seller: {
        id: string;
        username: string;
        phoneNumber?: string;
        profile?: {
            fullName?: string;
        };
    };
}

export default function WasteMarketplacePage() {
    const [listings, setListings] = useState<BiomassListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchListings();
    }, [selectedCategory]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            params.append('status', 'AVAILABLE');

            const res = await fetch(`/api/waste/listings?${params}`);
            if (res.ok) {
                const data = await res.json();
                setListings(data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryInfo = (categoryId: string) => {
        return WASTE_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, icon: '♻️' };
    };

    const filteredListings = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center">
                            <Recycle className="text-white" size={22} />
                        </div>
                        ตลาดชีวมวล
                    </h1>
                    <p className="text-slate-400 mt-1">ซื้อขายวัสดุเหลือใช้ทางการเกษตร</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lime-500 to-green-600 text-white font-medium rounded-xl hover:from-lime-600 hover:to-green-700 transition-all shadow-lg shadow-lime-500/25"
                >
                    <Plus size={20} />
                    ประกาศขาย
                </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === null
                            ? 'bg-lime-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    ทั้งหมด
                </button>
                {WASTE_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                ? 'bg-lime-500 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="ค้นหาวัสดุชีวมวล..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500"
                />
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-lime-500 border-t-transparent" />
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <Recycle className="mx-auto text-slate-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">ยังไม่มีประกาศ</h3>
                    <p className="text-slate-400">ลองเปลี่ยนตัวกรองหรือเป็นคนแรกที่ประกาศขาย!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map(listing => {
                        const catInfo = getCategoryInfo(listing.category);
                        const statusInfo = STATUS_LABELS[listing.status] || { label: listing.status, color: 'bg-slate-500' };

                        return (
                            <div
                                key={listing.id}
                                className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden hover:border-lime-500/50 transition-all group"
                            >
                                {/* Category Header */}
                                <div className="bg-gradient-to-r from-lime-600/20 to-green-600/20 px-4 py-3 flex items-center justify-between">
                                    <span className="text-2xl">{catInfo.icon}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-white text-lg group-hover:text-lime-400 transition-colors">
                                        {listing.title}
                                    </h3>

                                    {listing.description && (
                                        <p className="text-slate-400 text-sm line-clamp-2">{listing.description}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white">
                                            <Package size={18} className="text-lime-400" />
                                            <span className="font-medium">
                                                {Number(listing.quantity).toLocaleString()} {listing.unit}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lime-400 font-bold text-lg">
                                                ฿{Number(listing.pricePerUnit).toLocaleString()}
                                            </span>
                                            <span className="text-slate-400 text-sm">/{listing.unit}</span>
                                        </div>
                                    </div>

                                    {listing.locationName && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <MapPin size={16} />
                                            {listing.locationName}
                                        </div>
                                    )}

                                    {/* Seller Info */}
                                    <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-slate-400">ผู้ขาย: </span>
                                            <span className="text-white font-medium">
                                                {listing.seller.profile?.fullName || listing.seller.username}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {listing.seller.phoneNumber && (
                                                <a
                                                    href={`tel:${listing.seller.phoneNumber}`}
                                                    className="p-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition text-white"
                                                >
                                                    <Phone size={16} />
                                                </a>
                                            )}
                                            <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition text-white">
                                                <Truck size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateListingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchListings();
                    }}
                />
            )}
        </div>
    );
}

function CreateListingModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        category: 'RICE_STRAW',
        title: '',
        description: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        locationName: '',
        locationLat: 13.7563,
        locationLng: 100.5018,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/waste/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    quantity: parseFloat(formData.quantity),
                    pricePerUnit: parseFloat(formData.pricePerUnit),
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">ประกาศขายวัสดุชีวมวล</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ประเภทวัสดุ</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        >
                            {WASTE_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ชื่อประกาศ</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                            placeholder="เช่น ฟางข้าวแห้งคุณภาพดี"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">รายละเอียด</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            placeholder="อธิบายคุณสมบัติของวัสดุ..."
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        />
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">ปริมาณ</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.quantity}
                                onChange={e => setFormData(f => ({ ...f, quantity: e.target.value }))}
                                placeholder="100"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">หน่วย</label>
                            <select
                                value={formData.unit}
                                onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                            >
                                <option value="kg">กิโลกรัม</option>
                                <option value="ton">ตัน</option>
                                <option value="bag">กระสอบ</option>
                                <option value="cart">เกวียน</option>
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ราคาต่อหน่วย (บาท)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.pricePerUnit}
                            onChange={e => setFormData(f => ({ ...f, pricePerUnit: e.target.value }))}
                            placeholder="50"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">สถานที่</label>
                        <input
                            type="text"
                            value={formData.locationName}
                            onChange={e => setFormData(f => ({ ...f, locationName: e.target.value }))}
                            placeholder="เช่น ต.บางปลา อ.บางพลี จ.สมุทรปราการ"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-lime-500 to-green-600 text-white font-medium rounded-xl hover:from-lime-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'กำลังบันทึก...' : 'ประกาศขาย'}
                    </button>
                </form>
            </div>
        </div>
    );
}
