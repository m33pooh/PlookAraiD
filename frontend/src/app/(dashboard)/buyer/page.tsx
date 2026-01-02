import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart,
    FileText,
    TrendingUp,
    Users,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle
} from 'lucide-react';

// Mock data
const mockStats = {
    activeRequests: 5,
    pendingContracts: 3,
    completedContracts: 12,
    connectedFarmers: 28,
};

const mockRequests = [
    { id: 1, product: 'ข้าวหอมมะลิ', quantity: '10 ตัน', responses: 5, status: 'active' },
    { id: 2, product: 'มันสำปะหลัง', quantity: '50 ตัน', responses: 12, status: 'active' },
    { id: 3, product: 'อ้อย', quantity: '100 ตัน', responses: 3, status: 'pending' },
];

export default function BuyerDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        สวัสดี, บริษัท รับซื้อ จำกัด 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        ยินดีต้อนรับกลับ! นี่คือสรุปข้อมูลของคุณ
                    </p>
                </div>
                <Link href="/buyer/requests/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        ประกาศรับซื้อ
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">ประกาศรับซื้อ</p>
                                <p className="text-2xl font-bold text-white mt-1">{mockStats.activeRequests}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="text-emerald-600" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2 font-medium">
                            กำลังเปิดรับ
                        </p>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">สัญญารอดำเนินการ</p>
                                <p className="text-2xl font-bold text-white mt-1">{mockStats.pendingContracts}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            รอการยืนยัน
                        </p>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">สัญญาเสร็จสิ้น</p>
                                <p className="text-2xl font-bold text-white mt-1">{mockStats.completedContracts}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            ในปีนี้
                        </p>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">เกษตรกรในเครือข่าย</p>
                                <p className="text-2xl font-bold text-white mt-1">{mockStats.connectedFarmers}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2 font-medium">
                            +5 เดือนนี้
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Buy Requests */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="text-emerald-600" size={20} />
                            ประกาศรับซื้อล่าสุด
                        </CardTitle>
                        <Link href="/buyer/requests" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            ดูทั้งหมด <ArrowRight size={14} />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockRequests.map((req) => (
                            <div key={req.id} className="p-4 bg-slate-800 rounded-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-white">{req.product}</p>
                                        <p className="text-sm text-slate-400">ต้องการ {req.quantity}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-lg ${req.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {req.status === 'active' ? 'กำลังเปิดรับ' : 'รอยืนยัน'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                                    <Users size={14} />
                                    {req.responses} เกษตรกรตอบรับ
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Market Trends */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-blue-600" size={20} />
                            แนวโน้มตลาด
                        </CardTitle>
                        <Link href="/market" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            ดูราคาตลาด <ArrowRight size={14} />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { product: 'ข้าวหอมมะลิ', price: '15,000 บาท/ตัน', change: 5.2, trend: 'up' },
                                { product: 'มันสำปะหลัง', price: '3.2 บาท/กก.', change: 2.1, trend: 'up' },
                                { product: 'อ้อย', price: '1,000 บาท/ตัน', change: -1.5, trend: 'down' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                                    <div>
                                        <p className="font-medium text-white">{item.product}</p>
                                        <p className="text-sm text-slate-400">{item.price}</p>
                                    </div>
                                    <div className={`flex items-center gap-1 font-bold ${item.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {item.trend === 'up' ? '↑' : '↓'}
                                        {Math.abs(item.change)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
