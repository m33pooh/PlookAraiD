'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react';
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
    PRICE_ALERT: 'ราคา',
    ACTIVITY_REMINDER: 'กิจกรรม',
    WEATHER_ALERT: 'สภาพอากาศ',
    CONTRACT_STATUS: 'สัญญา',
    SERVICE_BOOKING: 'บริการ',
    QUEST_REWARD: 'แต้มสะสม',
    SYSTEM: 'ระบบ',
};

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                if (removed && !removed.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'เมื่อกี้';
        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
        if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
        return date.toLocaleDateString('th-TH');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-800 transition"
            >
                <Bell size={20} className="text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-xs font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <h3 className="font-semibold text-white">การแจ้งเตือน</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                            >
                                <CheckCheck size={14} />
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                กำลังโหลด...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                ไม่มีการแจ้งเตือน
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition group',
                                        !notification.isRead && 'bg-slate-800/30'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={cn(
                                                'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                                                notification.isRead ? 'bg-slate-600' : typeColors[notification.type]
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    'text-xs px-1.5 py-0.5 rounded',
                                                    typeColors[notification.type],
                                                    'bg-opacity-20 text-opacity-100'
                                                )}>
                                                    {typeLabels[notification.type] || notification.type}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="font-medium text-sm text-white mt-1 truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 hover:bg-slate-700 rounded"
                                                >
                                                    <ExternalLink size={14} className="text-slate-400" />
                                                </Link>
                                            )}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 hover:bg-slate-700 rounded"
                                                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                                                >
                                                    <Check size={14} className="text-emerald-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 hover:bg-slate-700 rounded"
                                                title="ลบ"
                                            >
                                                <Trash2 size={14} className="text-rose-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700">
                        <Link
                            href="/farmer/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block text-center text-sm text-emerald-400 hover:text-emerald-300"
                        >
                            ดูทั้งหมด
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
