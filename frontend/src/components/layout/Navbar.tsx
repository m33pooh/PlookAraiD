import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Leaf className="text-white" size={24} />
                    </div>
                    <span className="font-bold text-xl text-white">ปลูกอะไรดี</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/market" className="text-slate-400 hover:text-emerald-400 transition">
                        ราคาตลาด
                    </Link>
                    <Link href="/search" className="text-slate-400 hover:text-emerald-400 transition">
                        ค้นหาพืช
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="sm">เข้าสู่ระบบ</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm">สมัครสมาชิก</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
