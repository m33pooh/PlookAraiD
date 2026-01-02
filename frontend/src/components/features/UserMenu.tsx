'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (status === 'loading') {
        return (
            <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse" />
        );
    }

    if (!session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/login">
                    <Button variant="ghost" size="sm">
                        เข้าสู่ระบบ
                    </Button>
                </Link>
                <Link href="/register">
                    <Button size="sm">
                        สมัครสมาชิก
                    </Button>
                </Link>
            </div>
        );
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="text-emerald-600" size={18} />
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-700">
                        {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-slate-500">
                        {session.user.role === 'FARMER' ? 'เกษตรกร' : 'ผู้รับซื้อ'}
                    </p>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-700">
                            {session.user.name || session.user.email}
                        </p>
                        <p className="text-xs text-slate-500">{session.user.email}</p>
                    </div>

                    <Link
                        href={`/${session.user.role === 'FARMER' ? 'farmer' : 'buyer'}/settings`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <Settings size={16} />
                        ตั้งค่าบัญชี
                    </Link>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                        <LogOut size={16} />
                        ออกจากระบบ
                    </button>
                </div>
            )}
        </div>
    );
}
