'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { Role } from '@/types';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<Role>('FARMER');
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setIsLoading(true);

        try {
            // Register user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    role,
                    phoneNumber: formData.phone || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
                setIsLoading(false);
                return;
            }

            // Auto-login after registration
            const loginResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (loginResult?.error) {
                // Registration succeeded but auto-login failed, redirect to login
                router.push('/login');
            } else {
                // Redirect to appropriate dashboard
                router.push(role === 'FARMER' ? '/farmer' : '/buyer');
            }
            router.refresh();
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 py-12">
            {/* Decorative background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-900/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-900/30 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Leaf className="text-white" size={28} />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
                    <CardDescription>
                        สร้างบัญชีเพื่อเริ่มต้นใช้งาน
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('FARMER')}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'FARMER'
                                ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            <div className="text-2xl mb-1">👨‍🌾</div>
                            <div className="font-medium">เกษตรกร</div>
                            <div className="text-xs text-slate-500">ปลูกและขายผลผลิต</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('BUYER')}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'BUYER'
                                ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            <div className="text-2xl mb-1">🏪</div>
                            <div className="font-medium">ผู้รับซื้อ</div>
                            <div className="text-xs text-slate-500">รับซื้อผลผลิต</div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="ชื่อผู้ใช้"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="อีเมล"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="tel"
                                placeholder="เบอร์โทรศัพท์"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-10"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="รหัสผ่าน"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="ยืนยันรหัสผ่าน"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <>กำลังสมัครสมาชิก...</>
                            ) : (
                                <>
                                    สมัครสมาชิก
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        มีบัญชีแล้ว?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            เข้าสู่ระบบ
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
