'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bell,
    BellOff,
    Clock,
    Save,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPreference {
    id: string;
    priceAlerts: boolean;
    activityReminders: boolean;
    weatherAlerts: boolean;
    contractUpdates: boolean;
    serviceUpdates: boolean;
    questRewards: boolean;
    quietHoursStart: number | null;
    quietHoursEnd: number | null;
}

const preferenceItems = [
    { key: 'priceAlerts', label: 'แจ้งเตือนราคา', description: 'เมื่อราคาพืชผลถึงเป้าหมายที่ตั้งไว้', icon: '💰' },
    { key: 'activityReminders', label: 'กิจกรรมประจำวัน', description: 'เตือนการรดน้ำ, ใส่ปุ๋ย, เก็บเกี่ยว', icon: '🌱' },
    { key: 'weatherAlerts', label: 'แจ้งเตือนสภาพอากาศ', description: 'พายุ, น้ำท่วม, ภาวะแห้งแล้ง', icon: '⛈️' },
    { key: 'contractUpdates', label: 'สถานะสัญญา', description: 'เมื่อสัญญาถูกเซ็นหรือเสร็จสิ้น', icon: '📝' },
    { key: 'serviceUpdates', label: 'สถานะบริการ', description: 'เมื่อผู้ให้บริการรับงาน, มาถึง, หรือเสร็จงาน', icon: '🚜' },
    { key: 'questRewards', label: 'แต้มและรางวัล', description: 'เมื่อได้รับแต้มหรือแลกรางวัลสำเร็จ', icon: '🎮' },
];

const hours = Array.from({ length: 24 }, (_, i) => i);

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await fetch('/api/notifications/preferences');
                if (res.ok) {
                    const data = await res.json();
                    setPreferences(data);
                }
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const togglePreference = (key: string) => {
        if (!preferences) return;
        setPreferences(prev => prev ? { ...prev, [key]: !prev[key as keyof NotificationPreference] } : null);
        setSaved(false);
    };

    const updateQuietHours = (field: 'quietHoursStart' | 'quietHoursEnd', value: number | null) => {
        if (!preferences) return;
        setPreferences(prev => prev ? { ...prev, [field]: value } : null);
        setSaved(false);
    };

    const savePreferences = async () => {
        if (!preferences) return;

        try {
            setSaving(true);
            const res = await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceAlerts: preferences.priceAlerts,
                    activityReminders: preferences.activityReminders,
                    weatherAlerts: preferences.weatherAlerts,
                    contractUpdates: preferences.contractUpdates,
                    serviceUpdates: preferences.serviceUpdates,
                    questRewards: preferences.questRewards,
                    quietHoursStart: preferences.quietHoursStart,
                    quietHoursEnd: preferences.quietHoursEnd,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const formatHour = (hour: number) => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">กำลังโหลด...</p>
            </div>
        );
    }

    if (!preferences) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center">
                <p className="text-slate-400">ไม่สามารถโหลดการตั้งค่าได้</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
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
                            <Bell className="text-emerald-500" />
                            ตั้งค่าการแจ้งเตือน
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            เลือกประเภทการแจ้งเตือนที่ต้องการรับ
                        </p>
                    </div>
                </div>

                <button
                    onClick={savePreferences}
                    disabled={saving || saved}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium',
                        saved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    )}
                >
                    {saved ? (
                        <>
                            <Check size={16} />
                            บันทึกแล้ว
                        </>
                    ) : saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            บันทึก
                        </>
                    )}
                </button>
            </div>

            {/* Notification Types */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="font-semibold text-white">ประเภทการแจ้งเตือน</h2>
                    <p className="text-sm text-slate-400 mt-1">เปิด-ปิดการแจ้งเตือนแต่ละประเภท</p>
                </div>

                {preferenceItems.map((item, index) => {
                    const isEnabled = preferences[item.key as keyof NotificationPreference] as boolean;
                    return (
                        <div
                            key={item.key}
                            className={cn(
                                'px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition',
                                index !== preferenceItems.length - 1 && 'border-b border-slate-800'
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="font-medium text-white">{item.label}</p>
                                    <p className="text-sm text-slate-400">{item.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => togglePreference(item.key)}
                                className={cn(
                                    'relative w-12 h-6 rounded-full transition',
                                    isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                                        isEnabled ? 'left-7' : 'left-1'
                                    )}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Quiet Hours */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <BellOff size={20} className="text-slate-400" />
                        <h2 className="font-semibold text-white">ช่วงเวลาห้ามรบกวน</h2>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                        ระบบจะไม่ส่งการแจ้งเตือนในช่วงเวลาที่กำหนด
                    </p>
                </div>

                <div className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-slate-300">เริ่ม:</span>
                            <select
                                value={preferences.quietHoursStart ?? ''}
                                onChange={(e) => updateQuietHours('quietHoursStart', e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="">ไม่ระบุ</option>
                                {hours.map(h => (
                                    <option key={h} value={h}>{formatHour(h)}</option>
                                ))}
                            </select>
                        </div>

                        <span className="text-slate-500">ถึง</span>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-300">สิ้นสุด:</span>
                            <select
                                value={preferences.quietHoursEnd ?? ''}
                                onChange={(e) => updateQuietHours('quietHoursEnd', e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="">ไม่ระบุ</option>
                                {hours.map(h => (
                                    <option key={h} value={h}>{formatHour(h)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {preferences.quietHoursStart !== null && preferences.quietHoursEnd !== null && (
                        <p className="text-sm text-amber-400 mt-3">
                            🔕 ระบบจะไม่ส่ง Push Notification ระหว่าง {formatHour(preferences.quietHoursStart)} - {formatHour(preferences.quietHoursEnd)}
                        </p>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">
                    💡 <strong className="text-slate-300">หมายเหตุ:</strong> การแจ้งเตือนทั้งหมดจะยังคงแสดงในศูนย์การแจ้งเตือน
                    แม้จะปิดการแจ้งเตือนประเภทนั้นๆ (เฉพาะ Push Notification ที่จะไม่ถูกส่ง)
                </p>
            </div>
        </div>
    );
}
