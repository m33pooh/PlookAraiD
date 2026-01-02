'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    Leaf,
    Home,
    MapPin,
    Sprout,
    ShoppingCart,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Gift,
    BarChart3,
    Database,
    Shield,
    Truck,
    BookOpen,
    Cpu,
    Recycle,
    Target,
    Award,
    DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/features/UserMenu';
import { NotificationDropdown } from '@/components/features/NotificationDropdown';

const farmerNavItems = [
    { href: '/farmer', icon: Home, label: 'หน้าหลัก' },
    { href: '/farmer/farms', icon: MapPin, label: 'แปลงเกษตร' },
    { href: '/farmer/plan', icon: FileText, label: 'แผนการผลิต' },
    { href: '/farmer/cultivations', icon: Sprout, label: 'การเพาะปลูก' },
    { href: '/farmer/contracts', icon: FileText, label: 'สัญญารับซื้อ' },
    { href: '/farmer/logistics', icon: Truck, label: 'ขนส่งสินค้า' },
    { href: '/farmer/waste', icon: Recycle, label: 'ตลาดชีวมวล' },
    { href: '/farmer/iot', icon: Cpu, label: 'IoT Dashboard' },
    { href: '/farmer/notifications', icon: Bell, label: 'การแจ้งเตือน' },
    { href: '/farmer/price-alerts', icon: BarChart3, label: 'แจ้งเตือนราคา' },
    { href: '/farmer/quests', icon: Target, label: 'ภารกิจ' },
    { href: '/farmer/rewards', icon: Award, label: 'แต้มสะสม' },
    { href: '/farmer/promotions', icon: Gift, label: 'โปรโมชั่น' },
    { href: '/search', icon: ShoppingCart, label: 'ค้นหาพืช' },
    { href: '/farmer/market-analysis', icon: BarChart3, label: 'วิเคราะห์ตลาด' },
    { href: '/knowledge', icon: BookOpen, label: 'ความรู้เกษตร' },
    { href: '/farmer/settings', icon: Settings, label: 'ตั้งค่า' },
];

const buyerNavItems = [
    { href: '/buyer', icon: Home, label: 'หน้าหลัก' },
    { href: '/buyer/requests', icon: ShoppingCart, label: 'ประกาศรับซื้อ' },
    { href: '/buyer/contracts', icon: FileText, label: 'สัญญา' },
    { href: '/promotions', icon: Gift, label: 'โปรโมชั่น' },
    { href: '/market', icon: Sprout, label: 'ราคาตลาด' },
    { href: '/buyer/settings', icon: Settings, label: 'ตั้งค่า' },
];

const adminNavItems = [
    { href: '/admin', icon: Database, label: 'จัดการข้อมูลราคา' },
    { href: '/admin/manage-prices', icon: DollarSign, label: 'จัดการราคาตลาด' },
    { href: '/admin/knowledge', icon: BookOpen, label: 'จัดการความรู้' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Determine if we're in farmer or buyer section
    const isFarmer = pathname.startsWith('/farmer');
    const navItems = isFarmer ? farmerNavItems : buyerNavItems;

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col",
                "lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Leaf className="text-white" size={22} />
                        </div>
                        <span className="font-bold text-lg text-white">ปลูกอะไรดี</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-slate-800"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Scrollable Navigation Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                        isActive
                                            ? "bg-emerald-600 text-white font-medium"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon size={20} className={isActive ? "text-emerald-600" : ""} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Admin Zone */}
                    <div className="px-4 mt-2 pb-4">
                        <div className="border-t border-slate-700 pt-4">
                            <div className="flex items-center gap-2 px-4 mb-2">
                                <Shield size={14} className="text-amber-500" />
                                <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">Admin Zone</span>
                            </div>
                            {adminNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                            isActive
                                                ? "bg-amber-600 text-white font-medium"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Logout - Fixed at bottom */}
                <div className="p-4 border-t border-slate-800 flex-shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-all"
                    >
                        <LogOut size={20} />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-64">
                {/* Top navbar */}
                <header className="sticky top-0 z-30 h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
                    >
                        <Menu size={22} className="text-slate-400" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User menu */}
                        <div className="pl-4 border-l border-slate-700">
                            <UserMenu />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

