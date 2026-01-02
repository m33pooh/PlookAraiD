'use client';

import React, { useState, useEffect } from 'react';
import {
    Recycle,
    Plus,
    Edit,
    Trash2,
    Package,
    MapPin,
    ArrowLeft,
    Check,
    X,
    Clock,
} from 'lucide-react';
import Link from 'next/link';

const WASTE_CATEGORIES = [
    { id: 'RICE_STRAW', label: 'ฟางข้าว', icon: '🌾' },
    { id: 'CORN_COB', label: 'ซังข้าวโพด', icon: '🌽' },
    { id: 'SUGARCANE_LEAVES', label: 'ใบอ้อย', icon: '🎋' },
    { id: 'ANIMAL_MANURE', label: 'มูลสัตว์', icon: '🐄' },
    { id: 'FRUIT_WASTE', label: 'เศษผลไม้', icon: '🍎' },
    { id: 'VEGETABLE_WASTE', label: 'เศษผัก', icon: '🥬' },
    { id: 'OTHER', label: 'อื่นๆ', icon: '♻️' },
];

const STATUS_OPTIONS = [
    { id: 'AVAILABLE', label: 'พร้อมขาย', color: 'bg-emerald-500' },
    { id: 'RESERVED', label: 'จองแล้ว', color: 'bg-amber-500' },
    { id: 'SOLD', label: 'ขายแล้ว', color: 'bg-slate-500' },
];

interface BiomassListing {
    id: string;
    category: string;
    title: string;
    description?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    locationName?: string;
    status: string;
    createdAt: string;
}

export default function MyWasteListingsPage() {
    const [listings, setListings] = useState<BiomassListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        setLoading(true);
        try {
            // Fetch all listings - the API will filter by current user on server side
            // We'll fetch all and show user's own
            const res = await fetch('/api/waste/listings');
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

    const handleStatusChange = async (listingId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/waste/listings/${listingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setListings(listings.map(l =>
                    l.id === listingId ? { ...l, status: newStatus } : l
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (listingId: string) => {
        if (!confirm('ยืนยันการลบประกาศนี้?')) return;

        try {
            const res = await fetch(`/api/waste/listings/${listingId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setListings(listings.filter(l => l.id !== listingId));
            }
        } catch (error) {
            console.error('Error deleting listing:', error);
        }
    };

    const getCategoryInfo = (categoryId: string) => {
        return WASTE_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, icon: '♻️' };
    };

    const getStatusInfo = (status: string) => {
        return STATUS_OPTIONS.find(s => s.id === status) || { label: status, color: 'bg-slate-500' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/farmer/waste"
                        className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center">
                                <Recycle className="text-white" size={22} />
                            </div>
                            ประกาศของฉัน
                        </h1>
                        <p className="text-slate-400 mt-1">จัดการประกาศขายวัสดุชีวมวลของคุณ</p>
                    </div>
                </div>
                <Link
                    href="/farmer/waste"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lime-500 to-green-600 text-white font-medium rounded-xl hover:from-lime-600 hover:to-green-700 transition-all"
                >
                    <Plus size={20} />
                    ประกาศใหม่
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {STATUS_OPTIONS.map(status => {
                    const count = listings.filter(l => l.status === status.id).length;
                    return (
                        <div key={status.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                <span className="text-slate-300">{status.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-white mt-2">{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Listings Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-lime-500 border-t-transparent" />
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <Recycle className="mx-auto text-slate-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">ยังไม่มีประกาศ</h3>
                    <p className="text-slate-400 mb-4">เริ่มต้นด้วยการสร้างประกาศขายวัสดุชีวมวลของคุณ</p>
                    <Link
                        href="/farmer/waste"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-500 text-white font-medium rounded-xl hover:bg-lime-600 transition"
                    >
                        <Plus size={20} />
                        สร้างประกาศ
                    </Link>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">รายการ</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ปริมาณ</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ราคา</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">สถานะ</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {listings.map(listing => {
                                const catInfo = getCategoryInfo(listing.category);
                                const statusInfo = getStatusInfo(listing.status);

                                return (
                                    <tr key={listing.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{catInfo.icon}</span>
                                                <div>
                                                    <p className="font-medium text-white">{listing.title}</p>
                                                    <p className="text-sm text-slate-400">{catInfo.label}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-white">
                                                {Number(listing.quantity).toLocaleString()} {listing.unit}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-lime-400 font-medium">
                                                ฿{Number(listing.pricePerUnit).toLocaleString()}/{listing.unit}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={listing.status}
                                                onChange={e => handleStatusChange(listing.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${statusInfo.color} border-none outline-none cursor-pointer`}
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
