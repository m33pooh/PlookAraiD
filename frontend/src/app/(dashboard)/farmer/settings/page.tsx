'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    ChevronRight,
    Save,
    Check,
    Camera,
    Loader2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import MapPicker to avoid SSR issues
const MapPicker = dynamic(
    () => import('@/components/ui/map/map-picker'),
    { ssr: false, loading: () => <div className="h-[300px] bg-slate-800 rounded-xl animate-pulse" /> }
);

interface UserProfile {
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    address: string | null;
    locationLat: number | null;
    locationLng: number | null;
}

const settingSections = [
    {
        id: 'notifications',
        label: 'การแจ้งเตือน',
        description: 'ตั้งค่าการแจ้งเตือนและช่วงเวลาห้ามรบกวน',
        icon: Bell,
        href: '/farmer/notifications/settings',
        color: 'from-amber-500 to-orange-500',
    },
    {
        id: 'price-alerts',
        label: 'แจ้งเตือนราคา',
        description: 'ตั้งค่าแจ้งเตือนเมื่อราคาพืชผลถึงเป้าหมาย',
        icon: Bell,
        href: '/farmer/price-alerts',
        color: 'from-yellow-500 to-amber-500',
    },
];

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile form state
    const [profile, setProfile] = useState<UserProfile>({
        fullName: '',
        bio: '',
        avatarUrl: '',
        phoneNumber: '',
        address: '',
        locationLat: null,
        locationLng: null,
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        fullName: data.profile?.fullName || '',
                        bio: data.profile?.bio || '',
                        avatarUrl: data.profile?.avatarUrl || '',
                        phoneNumber: data.phoneNumber || '',
                        address: data.profile?.address || '',
                        locationLat: data.profile?.locationLat ? parseFloat(data.profile.locationLat) : null,
                        locationLng: data.profile?.locationLng ? parseFloat(data.profile.locationLng) : null,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileSave = async () => {
        try {
            setSaving(true);
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: profile.fullName,
                    bio: profile.bio,
                    avatarUrl: profile.avatarUrl,
                    phoneNumber: profile.phoneNumber,
                    address: profile.address,
                    locationLat: profile.locationLat,
                    locationLng: profile.locationLng,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                // Update session if name changed
                if (profile.fullName) {
                    await updateSession({ name: profile.fullName });
                }
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        try {
            setSaving(true);
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSaved(false), 3000);
            } else {
                const error = await res.json();
                setPasswordError(error.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            setPasswordError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/farmer"
                    className="p-2 rounded-lg hover:bg-slate-800 transition"
                >
                    <ArrowLeft size={20} className="text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                            <Settings className="text-white" size={22} />
                        </div>
                        ตั้งค่า
                    </h1>
                    <p className="text-slate-400 mt-1">จัดการโปรไฟล์และตั้งค่าระบบ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar - Quick Links */}
                <div className="lg:col-span-1 space-y-4">
                    {/* User Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    session?.user?.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {profile.fullName || session?.user?.name || 'ผู้ใช้'}
                                </p>
                                <p className="text-sm text-slate-400">{session?.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800">
                            <h3 className="font-medium text-slate-300">ลิงก์ด่วน</h3>
                        </div>
                        {settingSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Link
                                    key={section.id}
                                    href={section.href}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/50 transition border-b border-slate-800 last:border-b-0"
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                                        section.color
                                    )}>
                                        <Icon className="text-white" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{section.label}</p>
                                        <p className="text-xs text-slate-400">{section.description}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-500" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={cn(
                                'px-4 py-3 font-medium transition-all border-b-2 -mb-px flex items-center gap-2',
                                activeTab === 'profile'
                                    ? 'text-emerald-400 border-emerald-400'
                                    : 'text-slate-400 border-transparent hover:text-white'
                            )}
                        >
                            <User size={18} />
                            โปรไฟล์
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={cn(
                                'px-4 py-3 font-medium transition-all border-b-2 -mb-px flex items-center gap-2',
                                activeTab === 'security'
                                    ? 'text-emerald-400 border-emerald-400'
                                    : 'text-slate-400 border-transparent hover:text-white'
                            )}
                        >
                            <Shield size={18} />
                            ความปลอดภัย
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white">ข้อมูลโปรไฟล์</h2>
                                <button
                                    onClick={handleProfileSave}
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
                                            <Loader2 className="animate-spin" size={16} />
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

                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            session?.user?.name?.[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition">
                                        <Camera size={14} className="text-white" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">URL รูปโปรไฟล์</label>
                                    <input
                                        type="url"
                                        value={profile.avatarUrl || ''}
                                        onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <User size={14} className="inline mr-2" />
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    value={profile.fullName || ''}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    placeholder="ชื่อ นามสกุล"
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Phone size={14} className="inline mr-2" />
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    value={profile.phoneNumber || ''}
                                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                    placeholder="08x-xxx-xxxx"
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <MapPin size={14} className="inline mr-2" />
                                    ที่อยู่
                                </label>
                                <textarea
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="ที่อยู่ สำหรับติดต่อ"
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    ประวัติย่อ / คำอธิบาย
                                </label>
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="เล่าเกี่ยวกับตัวคุณหรือฟาร์มของคุณ..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>

                            {/* Farm Location Map */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <MapPin size={14} className="inline mr-2" />
                                    พิกัดแปลงเกษตร
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    คลิกบนแผนที่หรือใช้ปุ่ม GPS เพื่อปักหมุดตำแหน่งแปลงของคุณ
                                </p>
                                <MapPicker
                                    value={profile.locationLat && profile.locationLng ? { lat: profile.locationLat, lng: profile.locationLng } : null}
                                    onChange={(loc) => setProfile({ ...profile, locationLat: loc.lat, locationLng: loc.lng })}
                                    height="300px"
                                />
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Lock size={20} className="text-slate-400" />
                                    เปลี่ยนรหัสผ่าน
                                </h2>
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={saving || saved || !passwordForm.currentPassword || !passwordForm.newPassword}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed',
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
                                            <Loader2 className="animate-spin" size={16} />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            เปลี่ยนรหัสผ่าน
                                        </>
                                    )}
                                </button>
                            </div>

                            {passwordError && (
                                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                                    {passwordError}
                                </div>
                            )}

                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">รหัสผ่านปัจจุบัน</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">รหัสผ่านใหม่</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">ยืนยันรหัสผ่านใหม่</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <p className="text-sm text-slate-400">
                                    💡 <strong className="text-slate-300">คำแนะนำ:</strong> เลือกรหัสผ่านที่แข็งแรง
                                    ประกอบด้วยตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
