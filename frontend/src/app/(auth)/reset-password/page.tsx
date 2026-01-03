'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Lock, ArrowRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            setError('ลิงก์ไม่ถูกต้องหรือหมดอายุ');
        } else {
            setIsValidToken(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
                setIsLoading(false);
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            {/* Decorative background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-900/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-900/30 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Leaf className="text-white" size={28} />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">ตั้งรหัสผ่านใหม่</CardTitle>
                    <CardDescription>
                        {isSuccess
                            ? 'รีเซ็ตรหัสผ่านสำเร็จ!'
                            : 'กรุณากรอกรหัสผ่านใหม่ที่ต้องการใช้'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isSuccess ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-emerald-400" size={32} />
                            </div>
                            <p className="text-slate-400 mb-4">
                                กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
                            </p>
                            <Link href="/login">
                                <Button className="gap-2">
                                    เข้าสู่ระบบ
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>
                    ) : !isValidToken ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-rose-400" size={32} />
                            </div>
                            <p className="text-slate-400 mb-6">
                                ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
                            </p>
                            <Link href="/forgot-password">
                                <Button variant="outline">
                                    ขอลิงก์ใหม่
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="รหัสผ่านใหม่"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="ยืนยันรหัสผ่านใหม่"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                    {isLoading ? 'กำลังบันทึก...' : (
                                        <>
                                            บันทึกรหัสผ่านใหม่
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                Loading...
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
