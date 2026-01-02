import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
    return (
        <footer className="py-12 px-4 bg-slate-950 text-slate-400 border-t border-slate-800">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <Leaf className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-white">ปลูกอะไรดี</span>
                    </div>

                    <div className="flex gap-6 text-sm">
                        <Link href="/about" className="hover:text-white transition">เกี่ยวกับเรา</Link>
                        <Link href="/contact" className="hover:text-white transition">ติดต่อ</Link>
                        <Link href="/privacy" className="hover:text-white transition">นโยบายความเป็นส่วนตัว</Link>
                    </div>

                    <p className="text-sm">© 2024 ปลูกอะไรดี. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
