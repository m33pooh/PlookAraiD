'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

// Helper function to get landing page by role
function getRoleLandingPage(role: string): string {
    switch (role) {
        case 'FARMER':
            return '/farmer';
        case 'BUYER':
            return '/buyer';
        case 'ADMIN':
            return '/admin';
        default:
            return '/';
    }
}

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl');
    const error = searchParams.get('error');

    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(
        error === 'CredentialsSignin' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : null
    );
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError(null);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            console.log('SignIn result:', result);

            // Check for login failure - only check error, not ok
            if (result?.error) {
                console.log('Login error:', result.error);
                setLoginError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                setIsLoading(false);
                return;
            }

            // Login successful - redirect
            console.log('Login successful, fetching session...');
            const session = await getSession();
            console.log('Session:', session);

            const role = session?.user?.role || 'FARMER';
            const redirectUrl = callbackUrl || getRoleLandingPage(role);

            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Login exception:', error);
            setLoginError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
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
                    <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
                    <CardDescription>
                        ยินดีต้อนรับกลับ! กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {loginError && (
                        <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                            <AlertCircle size={18} />
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="อีเมล"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10"
                                autoComplete="off"
                                required
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
                                autoComplete="new-password"
                                required
                            />
                        </div>



                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <>กำลังเข้าสู่ระบบ...</>
                            ) : (
                                <>
                                    เข้าสู่ระบบ
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            สมัครสมาชิก
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
