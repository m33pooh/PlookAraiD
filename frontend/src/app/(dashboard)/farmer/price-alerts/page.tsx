'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bell,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    ToggleLeft,
    ToggleRight,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    category: string;
    imageUrl?: string;
}

interface PriceAlert {
    id: string;
    productId: number;
    targetPrice: string;
    isAbove: boolean;
    isActive: boolean;
    triggeredAt: string | null;
    createdAt: string;
    product: Product;
}

export default function PriceAlertsPage() {
    const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAlert, setNewAlert] = useState({
        productId: 0,
        targetPrice: '',
        isAbove: true,
    });

    useEffect(() => {
        fetchAlerts();
        fetchProducts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/price-alerts');
            if (res.ok) {
                const data = await res.json();
                setPriceAlerts(data.priceAlerts);
            }
        } catch (error) {
            console.error('Failed to fetch price alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const createAlert = async () => {
        if (!newAlert.productId || !newAlert.targetPrice) return;

        try {
            const res = await fetch('/api/price-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: newAlert.productId,
                    targetPrice: parseFloat(newAlert.targetPrice),
                    isAbove: newAlert.isAbove,
                }),
            });

            if (res.ok) {
                const created = await res.json();
                setPriceAlerts(prev => [created, ...prev]);
                setShowModal(false);
                setNewAlert({ productId: 0, targetPrice: '', isAbove: true });
            } else {
                const error = await res.json();
                alert(error.error || 'ไม่สามารถสร้างการแจ้งเตือนได้');
            }
        } catch (error) {
            console.error('Failed to create alert:', error);
        }
    };

    const toggleAlert = async (id: string, currentState: boolean) => {
        try {
            const res = await fetch(`/api/price-alerts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentState }),
            });

            if (res.ok) {
                setPriceAlerts(prev =>
                    prev.map(a => (a.id === id ? { ...a, isActive: !currentState } : a))
                );
            }
        } catch (error) {
            console.error('Failed to toggle alert:', error);
        }
    };

    const deleteAlert = async (id: string) => {
        if (!confirm('ต้องการลบการแจ้งเตือนนี้?')) return;

        try {
            const res = await fetch(`/api/price-alerts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPriceAlerts(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const formatPrice = (price: string) => {
        return parseFloat(price).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/farmer/notifications"
                        className="p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Bell className="text-amber-500" />
                            แจ้งเตือนราคา
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            ตั้งค่าแจ้งเตือนเมื่อราคาพืชผลถึงเป้าหมายที่กำหนด
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition font-medium"
                >
                    <Plus size={20} />
                    เพิ่มการแจ้งเตือน
                </button>
            </div>

            {/* Alerts List */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        กำลังโหลด...
                    </div>
                ) : priceAlerts.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={48} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">ยังไม่มีการแจ้งเตือนราคา</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition"
                        >
                            สร้างการแจ้งเตือนแรก
                        </button>
                    </div>
                ) : (
                    priceAlerts.map((alert, index) => (
                        <div
                            key={alert.id}
                            className={cn(
                                'px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 transition',
                                index !== priceAlerts.length - 1 && 'border-b border-slate-800',
                                !alert.isActive && 'opacity-50'
                            )}
                        >
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                                {alert.product.imageUrl ? (
                                    <img
                                        src={alert.product.imageUrl}
                                        alt={alert.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl">🌾</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="font-medium text-white">{alert.product.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {alert.isAbove ? (
                                        <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                            <TrendingUp size={14} />
                                            แจ้งเตือนเมื่อราคา ≥
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-rose-400 text-sm">
                                            <TrendingDown size={14} />
                                            แจ้งเตือนเมื่อราคา ≤
                                        </span>
                                    )}
                                    <span className="text-amber-400 font-semibold">
                                        ฿{formatPrice(alert.targetPrice)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    สร้างเมื่อ {formatDate(alert.createdAt)}
                                    {alert.triggeredAt && ` • แจ้งเตือนเมื่อ ${formatDate(alert.triggeredAt)}`}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleAlert(alert.id, alert.isActive)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                                    title={alert.isActive ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'}
                                >
                                    {alert.isActive ? (
                                        <ToggleRight size={24} className="text-emerald-400" />
                                    ) : (
                                        <ToggleLeft size={24} className="text-slate-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                                    title="ลบ"
                                >
                                    <Trash2 size={18} className="text-rose-400" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">
                    💡 <strong className="text-slate-300">วิธีใช้งาน:</strong> เลือกผลผลิตที่ต้องการติดตาม
                    กำหนดราคาเป้าหมาย และเลือกว่าจะแจ้งเตือนเมื่อราคาสูงกว่าหรือต่ำกว่าเงื่อนไขที่ตั้งไว้
                </p>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6 m-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">สร้างการแจ้งเตือนราคา</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Product Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    ผลผลิต
                                </label>
                                <select
                                    value={newAlert.productId}
                                    onChange={(e) => setNewAlert(prev => ({ ...prev, productId: parseInt(e.target.value) }))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                                >
                                    <option value={0}>เลือกผลผลิต...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    ราคาเป้าหมาย (บาท)
                                </label>
                                <input
                                    type="number"
                                    value={newAlert.targetPrice}
                                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                                />
                            </div>

                            {/* Direction */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    เงื่อนไข
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewAlert(prev => ({ ...prev, isAbove: true }))}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition',
                                            newAlert.isAbove
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-800 text-slate-400'
                                        )}
                                    >
                                        <TrendingUp size={18} />
                                        ราคาขึ้น (≥)
                                    </button>
                                    <button
                                        onClick={() => setNewAlert(prev => ({ ...prev, isAbove: false }))}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition',
                                            !newAlert.isAbove
                                                ? 'bg-rose-600 text-white'
                                                : 'bg-slate-800 text-slate-400'
                                        )}
                                    >
                                        <TrendingDown size={18} />
                                        ราคาลง (≤)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={createAlert}
                                disabled={!newAlert.productId || !newAlert.targetPrice}
                                className="flex-1 px-4 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                สร้างการแจ้งเตือน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
