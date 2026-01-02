'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Filter,
    ArrowLeft,
    ExternalLink,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

const typeColors: Record<string, string> = {
    PRICE_ALERT: 'bg-amber-500',
    ACTIVITY_REMINDER: 'bg-emerald-500',
    WEATHER_ALERT: 'bg-red-500',
    CONTRACT_STATUS: 'bg-blue-500',
    SERVICE_BOOKING: 'bg-purple-500',
    QUEST_REWARD: 'bg-pink-500',
    SYSTEM: 'bg-slate-500',
};

const typeLabels: Record<string, string> = {
    PRICE_ALERT: 'แจ้งเตือนราคา',
    ACTIVITY_REMINDER: 'กิจกรรม',
    WEATHER_ALERT: 'สภาพอากาศ',
    CONTRACT_STATUS: 'สัญญา',
    SERVICE_BOOKING: 'บริการ',
    QUEST_REWARD: 'แต้มสะสม',
    SYSTEM: 'ระบบ',
};

const allTypes = Object.keys(typeLabels);

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const fetchNotifications = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const typeParam = selectedTypes.length > 0 ? `&type=${selectedTypes[0]}` : '';
            const res = await fetch(`/api/notifications?page=${pageNum}&limit=20${typeParam}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
                setTotalCount(data.pagination.totalCount);
                setTotalPages(data.pagination.totalPages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, [selectedTypes]);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/read-all', { method: 'POST' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const removed = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                setTotalCount(prev => prev - 1);
                if (removed && !removed.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const toggleTypeFilter = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [type]
        );
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/farmer"
                        className="p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Bell className="text-emerald-500" />
                            การแจ้งเตือน
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            ทั้งหมด {totalCount} รายการ • ยังไม่อ่าน {unreadCount} รายการ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/farmer/notifications/settings"
                        className="p-2 rounded-lg hover:bg-slate-800 transition"
                        title="ตั้งค่าการแจ้งเตือน"
                    >
                        <Settings size={20} className="text-slate-400" />
                    </Link>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-xl transition',
                            showFilters ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                        )}
                    >
                        <Filter size={16} />
                        ตัวกรอง
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
                        >
                            <CheckCheck size={16} />
                            อ่านทั้งหมด
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 mb-6">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">กรองตามประเภท</h3>
                    <div className="flex flex-wrap gap-2">
                        {allTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleTypeFilter(type)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2',
                                    selectedTypes.includes(type)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                )}
                            >
                                <span className={cn('w-2 h-2 rounded-full', typeColors[type])} />
                                {typeLabels[type]}
                            </button>
                        ))}
                        {selectedTypes.length > 0 && (
                            <button
                                onClick={() => setSelectedTypes([])}
                                className="px-3 py-1.5 rounded-lg text-sm bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 transition"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Notifications List */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        กำลังโหลด...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={48} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">ไม่มีการแจ้งเตือน</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    'px-6 py-4 hover:bg-slate-800/50 transition group',
                                    !notification.isRead && 'bg-slate-800/30',
                                    index !== notifications.length - 1 && 'border-b border-slate-800'
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <span
                                        className={cn(
                                            'w-3 h-3 mt-1.5 rounded-full flex-shrink-0',
                                            notification.isRead ? 'bg-slate-600' : typeColors[notification.type]
                                        )}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span
                                                className={cn(
                                                    'text-xs px-2 py-0.5 rounded',
                                                    typeColors[notification.type],
                                                    'bg-opacity-20'
                                                )}
                                            >
                                                {typeLabels[notification.type] || notification.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-white">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg"
                                                title="ไปยังลิงก์"
                                            >
                                                <ExternalLink size={16} className="text-slate-400" />
                                            </Link>
                                        )}
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg"
                                                title="ทำเครื่องหมายว่าอ่านแล้ว"
                                            >
                                                <Check size={16} className="text-emerald-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 hover:bg-slate-700 rounded-lg"
                                            title="ลบ"
                                        >
                                            <Trash2 size={16} className="text-rose-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
                                <button
                                    onClick={() => fetchNotifications(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                                >
                                    ก่อนหน้า
                                </button>
                                <span className="text-slate-400 px-4">
                                    หน้า {page} จาก {totalPages}
                                </span>
                                <button
                                    onClick={() => fetchNotifications(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex gap-4">
                <Link
                    href="/farmer/price-alerts"
                    className="flex-1 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-amber-500 transition group"
                >
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition">
                        ⏰ ตั้งแจ้งเตือนราคา
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        ตั้งค่าแจ้งเตือนเมื่อราคาพืชผลถึงเป้าหมายที่กำหนด
                    </p>
                </Link>
                <Link
                    href="/farmer/notifications/settings"
                    className="flex-1 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-emerald-500 transition group"
                >
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition">
                        ⚙️ ตั้งค่าการแจ้งเตือน
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        เลือกประเภทการแจ้งเตือนที่ต้องการรับ
                    </p>
                </Link>
            </div>
        </div>
    );
}
