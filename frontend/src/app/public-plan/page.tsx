import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
    MapPin,
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    ShoppingBag,
    PieChart,
    AlertCircle,
    Printer,
    Download,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyPlanPage() {
    // Mock Data: Production Plan
    const productionPlan = {
        project: "ปลูกข้าวโพดเลี้ยงสัตว์ (รุ่นหลังนา)",
        area: 10,
        startDate: "15 พ.ย. 2024",
        duration: 110,
        financials: {
            revenue: 126000,
            cost: 34850,
            profit: 91150,
            costPerRai: 3485
        },
        costs: [
            { category: "วัสดุปลูก", item: "เมล็ดพันธุ์ CP-888 (4 ถุง)", amount: 10000 },
            { category: "เตรียมดิน", item: "ค่ารถไถ (2 รอบ)", amount: 5000 },
            { category: "ปุ๋ย/ยา", item: "ปุ๋ยรองพื้น + แต่งหน้า + ฮอร์โมน", amount: 8450 },
            { category: "บริการ", item: "ค่าแรงปลูก + โดรน + รถเกี่ยว", amount: 9400 },
            { category: "อื่นๆ", item: "ค่าน้ำ/ไฟ", amount: 2000 },
        ],
        schedule: [
            { date: "15-20 พ.ย.", activity: "เตรียมดิน (ไถดะ+ไถแปร)", provider: "รถไถผู้ใหญ่บ้าน ม.3", cost: 5000, status: "completed" },
            { date: "22 พ.ย.", activity: "วันปลูก (หยอดเมล็ด)", provider: "เครื่องหยอดลุงพล", cost: 1500, status: "completed" },
            { date: "10 ธ.ค.", activity: "ระยะงอก (พ่นฮอร์โมน)", provider: "ทีมงานฟ้าใส (โดรน)", cost: 1200, status: "pending" },
            { date: "22 ธ.ค.", activity: "ระยะยืดตัว (ใส่ปุ๋ย)", provider: "แรงงานในครัวเรือน", cost: 0, status: "pending" },
            { date: "10 ม.ค.", activity: "ระยะออกดอก (กำจัดหนอน)", provider: "ทีมงานฟ้าใส (โดรน)", cost: 1200, status: "pending" },
            { date: "1-20 ก.พ.", activity: "ระยะสร้างเมล็ด (ให้น้ำ)", provider: "-", cost: 1000, status: "pending" },
            { date: "10 มี.ค.", activity: "เก็บเกี่ยวผลผลิต", provider: "เจ๊ติ๋ม รถเกี่ยวซิ่ง", cost: 5500, status: "pending" },
        ]
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {productionPlan.project}
                                <span className="text-sm font-normal bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">กำลังดำเนินการ</span>
                            </h2>
                            <p className="text-slate-400 mt-1 flex items-center gap-4 text-sm">
                                <span className="flex items-center"><MapPin size={14} className="mr-1" /> {productionPlan.area} ไร่</span>
                                <span className="flex items-center"><Calendar size={14} className="mr-1" /> เริ่ม {productionPlan.startDate}</span>
                                <span className="flex items-center"><Clock size={14} className="mr-1" /> ระยะเวลา {productionPlan.duration} วัน</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700">
                                <Printer size={16} /> พิมพ์รายงาน
                            </Button>
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg">
                                <Download size={16} /> ดาวน์โหลด PDF
                            </Button>
                        </div>
                    </div>

                    {/* Financial Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                <DollarSign size={64} className="text-emerald-400" />
                            </div>
                            <p className="text-slate-400 text-sm mb-1">กำไรสุทธิ (คาดการณ์)</p>
                            <h3 className="text-3xl font-bold text-emerald-400">฿{productionPlan.financials.profit.toLocaleString()}</h3>
                            <p className="text-xs text-emerald-500/80 mt-2 font-medium">+฿{productionPlan.financials.costPerRai.toLocaleString()} ต่อไร่</p>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden hover:border-sky-500/50 transition duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp size={64} className="text-sky-400" />
                            </div>
                            <p className="text-slate-400 text-sm mb-1">รายรับรวม</p>
                            <h3 className="text-3xl font-bold text-sky-400">฿{productionPlan.financials.revenue.toLocaleString()}</h3>
                            <p className="text-xs text-slate-500 mt-2">@ 10.50 บาท/กก.</p>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden hover:border-rose-500/50 transition duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShoppingBag size={64} className="text-rose-400" />
                            </div>
                            <p className="text-slate-400 text-sm mb-1">ต้นทุนรวม</p>
                            <h3 className="text-3xl font-bold text-rose-400">฿{productionPlan.financials.cost.toLocaleString()}</h3>
                            <p className="text-xs text-slate-500 mt-2">รวมค่าแรงและบริการแล้ว</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left: Schedule */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                                    <Calendar className="mr-2 text-emerald-400" size={20} /> ตารางกิจกรรม (Activity Schedule)
                                </h3>
                                <div className="relative pl-4 border-l-2 border-slate-700 space-y-8">
                                    {productionPlan.schedule.map((item, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            {/* Timeline Dot */}
                                            <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${item.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-600'}`}></div>

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase mb-1 inline-block ${item.status === 'completed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                        {item.status === 'completed' ? 'เสร็จสิ้น' : 'รอรับบริการ'}
                                                    </span>
                                                    <h4 className={`text-lg font-bold ${item.status === 'completed' ? 'text-slate-300 line-through decoration-slate-600' : 'text-white'}`}>{item.activity}</h4>
                                                    <p className="text-sm text-emerald-400 font-medium mt-0.5">{item.date}</p>
                                                    <p className="text-sm text-slate-400 mt-1 flex items-center">
                                                        <Users size={14} className="mr-1" /> {item.provider}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-300">฿{item.cost > 0 ? item.cost.toLocaleString() : '-'}</p>
                                                    {item.cost > 0 && <span className="text-xs text-slate-500">ค่าใช้จ่าย</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Cost Breakdown & Recommendation */}
                        <div className="space-y-6">
                            {/* Cost Breakdown */}
                            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <PieChart className="mr-2 text-amber-400" size={20} /> โครงสร้างต้นทุน
                                </h3>
                                <div className="space-y-4">
                                    {productionPlan.costs.map((c, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300">{c.category}</span>
                                                <span className="text-white font-medium">฿{c.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full"
                                                    style={{ width: `${(c.amount / productionPlan.financials.cost) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 truncate">{c.item}</p>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-slate-700 flex justify-between items-center">
                                        <span className="text-slate-400 font-bold">รวมทั้งหมด</span>
                                        <span className="text-xl font-bold text-rose-400">฿{productionPlan.financials.cost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendation */}
                            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800 rounded-2xl border border-emerald-500/20 p-5">
                                <h4 className="text-emerald-400 font-bold flex items-center mb-3">
                                    <AlertCircle size={18} className="mr-2" /> คำแนะนำจากระบบ
                                </h4>
                                <ul className="space-y-3">
                                    <li className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        <span>ควรจอง <strong>"บริการโดรนพ่นยา"</strong> ล่วงหน้า 1 เดือน เพื่อรับส่วนลด 10%</span>
                                    </li>
                                    <li className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        <span>แนะนำทำ <strong>"สัญญาซื้อขายล่วงหน้า"</strong> กับสหกรณ์ A เพื่อประกันราคาขั้นต่ำที่ 9.50 บาท</span>
                                    </li>
                                </ul>
                                <button className="w-full mt-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded-lg text-sm font-bold border border-emerald-600/30 transition">
                                    จัดการบริการใน Marketplace
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
