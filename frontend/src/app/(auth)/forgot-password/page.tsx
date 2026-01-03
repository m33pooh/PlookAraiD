'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
                setIsLoading(false);
                return;
            }

            setIsSubmitted(true);
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
                    <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
                    <CardDescription>
                        {isSubmitted
                            ? 'เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว'
                            : 'กรอกอีเมลที่ใช้สมัครสมาชิกเพื่อรีเซ็ตรหัสผ่าน'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-emerald-400" size={32} />
                            </div>
                            <p className="text-slate-400 mb-6">
                                กรุณาตรวจสอบอีเมลของคุณและคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน
                            </p>
                            <Link href="/login">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft size={18} />
                                    กลับไปหน้าเข้าสู่ระบบ
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
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="อีเมล"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} />
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
