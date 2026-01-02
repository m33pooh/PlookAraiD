'use client';

import React from 'react';

// ข้อมูลต้นทุน
const costData = {
    project: {
        name: 'ปลูกข้าวโพดเลี้ยงสัตว์ (รุ่นหลังนา)',
        area: 10,
        duration: 110,
        startDate: '15 พฤศจิกายน 2024',
        endDate: '10 มีนาคม 2025',
    },
    categories: [
        {
            name: 'หมวดวัสดุปลูก',
            icon: '🌱',
            items: [
                { name: 'เมล็ดพันธุ์ข้าวโพด CP-888', detail: '4 ถุง x 2,500 บ.', cost: 10000 },
            ],
        },
        {
            name: 'หมวดเตรียมดิน',
            icon: '🚜',
            items: [
                { name: 'ค่ารถไถ (ไถดะ + ไถแปร 2 รอบ)', detail: '', cost: 5000 },
            ],
        },
        {
            name: 'หมวดปุ๋ยและยา',
            icon: '🧪',
            items: [
                { name: 'ปุ๋ยรองพื้น สูตร 16-20-0', detail: '5 กระสอบ', cost: 4250 },
                { name: 'ปุ๋ยแต่งหน้า ยูเรีย 46-0-0', detail: '3 กระสอบ', cost: 2700 },
                { name: 'ฮอร์โมน / สารกำจัดแมลง', detail: '1 ชุด', cost: 1500 },
            ],
        },
        {
            name: 'หมวดแรงงานและบริการ',
            icon: '👷',
            items: [
                { name: 'ค่าแรงปลูก (เครื่องหยอด)', detail: '', cost: 1500 },
                { name: 'บริการโดรนพ่นยา', detail: '2 รอบ', cost: 2400 },
                { name: 'รถเกี่ยวข้าวโพด', detail: 'จองผ่าน Marketplace', cost: 5500 },
            ],
        },
        {
            name: 'หมวดอื่นๆ',
            icon: '💡',
            items: [
                { name: 'ค่าสูบน้ำ / ค่าไฟฟ้า', detail: 'เหมาจ่าย', cost: 2000 },
                { name: 'ค่าเช่าที่ดิน', detail: '', cost: 0 },
            ],
        },
    ],
};

// ตารางกิจกรรม
const activities = [
    {
        dateRange: '15-20 พ.ย. 67',
        phase: 'ระยะเตรียมดิน',
        activity: 'ไถดะ ตากดิน 7 วัน และไถแปร',
        provider: 'รถไถผู้ใหญ่บ้าน ม.3',
        cost: 5000,
        icon: '🚜',
        color: 'from-amber-500 to-orange-600',
    },
    {
        dateRange: '22 พ.ย. 67',
        phase: 'วันปลูก',
        activity: 'หยอดเมล็ดพร้อมปุ๋ยรองพื้น',
        provider: 'เครื่องหยอดลุงพล',
        cost: 1500,
        icon: '🌱',
        color: 'from-green-500 to-emerald-600',
    },
    {
        dateRange: '10 ธ.ค. 67',
        phase: 'ระยะงอก (18 วัน)',
        activity: 'พ่นฮอร์โมน/คุมหญ้า',
        provider: 'ทีมงานฟ้าใส เกษตรแม่นยำ (โดรน)',
        cost: 1200,
        icon: '🚁',
        color: 'from-cyan-500 to-blue-600',
    },
    {
        dateRange: '22 ธ.ค. 67',
        phase: 'ระยะยืดตัว (30 วัน)',
        activity: 'ใส่ปุ๋ยแต่งหน้า (ยูเรีย)',
        provider: 'แรงงานในครัวเรือน',
        cost: 0,
        icon: '🧪',
        color: 'from-purple-500 to-indigo-600',
    },
    {
        dateRange: '10 ม.ค. 68',
        phase: 'ระยะออกดอก (50 วัน)',
        activity: 'พ่นยากำจัดหนอนกระทู้ (ถ้ามีระบาด)',
        provider: 'ทีมงานฟ้าใส เกษตรแม่นยำ (โดรน)',
        cost: 1200,
        icon: '🐛',
        color: 'from-rose-500 to-pink-600',
    },
    {
        dateRange: '1-20 ก.พ. 68',
        phase: 'ระยะสร้างเมล็ด',
        activity: 'ให้น้ำสม่ำเสมอ (ห้ามขาดน้ำเด็ดขาด)',
        provider: '-',
        cost: 1000,
        icon: '💧',
        color: 'from-sky-500 to-cyan-600',
    },
    {
        dateRange: '10 มี.ค. 68',
        phase: 'วันเก็บเกี่ยว (110 วัน)',
        activity: 'เก็บเกี่ยวผลผลิตและขนส่ง',
        provider: 'เจ๊ติ๋ม รถเกี่ยวซิ่ง + รถบรรทุกสหกรณ์',
        cost: 8000,
        icon: '🌽',
        color: 'from-yellow-500 to-amber-600',
    },
];

// คำนวณต้นทุนรวม
const totalCost = costData.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + item.cost, 0),
    0
);

// ข้อมูล ROI
const roiData = {
    yieldPerRai: 1200,
    totalArea: 10,
    pricePerKg: 10.5,
    totalYield: 12000,
    totalRevenue: 126000,
    totalCost: totalCost,
    netProfit: 126000 - totalCost,
    profitPerRai: Math.round((126000 - totalCost) / 10),
    roi: Math.round(((126000 - totalCost) / totalCost) * 100),
};

export default function ProductionReportPreviewPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                        <span className="text-emerald-400 text-sm font-medium">📊 รายงานวิเคราะห์</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent mb-2">
                        รายงานวิเคราะห์ต้นทุนและตารางกิจกรรมการผลิต
                    </h1>
                    <p className="text-slate-400 text-lg">Production & Financial Plan</p>
                </div>

                {/* Project Info Card */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
                                🌽
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{costData.project.name}</h2>
                                <p className="text-slate-400">พื้นที่ {costData.project.area} ไร่ • {costData.project.duration} วัน</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                                <span className="text-slate-400 text-sm">เริ่ม</span>
                                <p className="text-white font-semibold">{costData.project.startDate}</p>
                            </div>
                            <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                                <span className="text-slate-400 text-sm">สิ้นสุด</span>
                                <p className="text-white font-semibold">{costData.project.endDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Estimation Section */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">💰</span>
                        สรุปประมาณการต้นทุน (Cost Estimation)
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {costData.categories.map((category, idx) => (
                            <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <span>{category.icon}</span>
                                    {category.name}
                                </h3>
                                <div className="space-y-2">
                                    {category.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex justify-between items-center py-2 border-b border-slate-700/30 last:border-0">
                                            <div>
                                                <span className="text-slate-300">{item.name}</span>
                                                {item.detail && <span className="text-slate-500 text-sm ml-2">({item.detail})</span>}
                                            </div>
                                            <span className={`font-semibold ${item.cost > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {item.cost > 0 ? `${item.cost.toLocaleString()} ฿` : '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Cost Summary */}
                    <div className="mt-6 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-xl p-4 border border-emerald-500/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-slate-300">รวมต้นทุนทั้งหมด</span>
                                <p className="text-sm text-slate-400">ต้นทุนเฉลี่ยต่อไร่: {(totalCost / 10).toLocaleString()} บาท/ไร่</p>
                            </div>
                            <span className="text-3xl font-bold text-emerald-400">{totalCost.toLocaleString()} ฿</span>
                        </div>
                    </div>
                </div>

                {/* Activity Schedule Section */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">📅</span>
                        ตารางกิจกรรมและราคาบริการ (Activity Schedule)
                    </h2>

                    <div className="space-y-4">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="relative">
                                {/* Timeline Connector */}
                                {idx < activities.length - 1 && (
                                    <div className="absolute left-7 top-16 w-0.5 h-8 bg-gradient-to-b from-slate-600 to-transparent" />
                                )}

                                <div className="flex gap-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 bg-gradient-to-br ${activity.color} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                                        {activity.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                            <div>
                                                <span className="text-sm font-medium text-slate-400">{activity.dateRange}</span>
                                                <h3 className="text-lg font-semibold text-white">{activity.phase}</h3>
                                            </div>
                                            <span className={`text-lg font-bold ${activity.cost > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {activity.cost > 0 ? `${activity.cost.toLocaleString()} ฿` : 'ไม่มีค่าใช้จ่าย'}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 mt-1">{activity.activity}</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            <span className="text-slate-400">ผู้ให้บริการ:</span> {activity.provider}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROI Analysis Section */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">📈</span>
                        วิเคราะห์ความคุ้มค่า (ROI Analysis)
                    </h2>

                    {/* Assumptions */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
                            <span className="text-slate-400 text-sm">ผลผลิตประมาณ</span>
                            <p className="text-2xl font-bold text-white">{roiData.yieldPerRai.toLocaleString()}</p>
                            <span className="text-slate-500 text-sm">กก./ไร่</span>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
                            <span className="text-slate-400 text-sm">ผลผลิตรวม</span>
                            <p className="text-2xl font-bold text-white">{roiData.totalYield.toLocaleString()}</p>
                            <span className="text-slate-500 text-sm">กก. ({roiData.totalYield / 1000} ตัน)</span>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
                            <span className="text-slate-400 text-sm">ราคาตลาดปัจจุบัน</span>
                            <p className="text-2xl font-bold text-white">{roiData.pricePerKg}</p>
                            <span className="text-slate-500 text-sm">บาท/กก.</span>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-5 border border-blue-500/30">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">รายรับรวม</span>
                                <span className="text-2xl font-bold text-blue-400">{roiData.totalRevenue.toLocaleString()} ฿</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {roiData.totalYield.toLocaleString()} กก. × {roiData.pricePerKg} บาท
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-600/20 to-orange-600/20 rounded-xl p-5 border border-rose-500/30">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">หักต้นทุนรวม</span>
                                <span className="text-2xl font-bold text-rose-400">-{roiData.totalCost.toLocaleString()} ฿</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                ต้นทุนเฉลี่ย {(roiData.totalCost / 10).toLocaleString()} บาท/ไร่
                            </p>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="mt-6 bg-gradient-to-r from-emerald-600/30 via-green-600/30 to-teal-600/30 rounded-2xl p-6 border border-emerald-500/40">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">กำไรสุทธิ (Net Profit)</h3>
                                <p className="text-emerald-300">
                                    กำไรต่อไร่: <span className="font-semibold">{roiData.profitPerRai.toLocaleString()} บาท</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-emerald-400">{roiData.netProfit.toLocaleString()} ฿</p>
                                <p className="text-emerald-300/70 text-sm">ROI: {roiData.roi}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <span>💡</span>
                        คำแนะนำจากระบบ
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-slate-300">
                            <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">1</span>
                            <span>หากจอง &quot;บริการโดรนพ่นยา&quot; ล่วงหน้า 1 เดือน ผ่านแอปฯ <span className="text-emerald-400 font-semibold">จะได้รับส่วนลด 10%</span></span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-300">
                            <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">2</span>
                            <span>ควรทำ &quot;สัญญาซื้อขายล่วงหน้า&quot; กับสหกรณ์ A เพื่อ<span className="text-emerald-400 font-semibold">ประกันราคาขั้นต่ำที่ 9.50 บาท</span></span>
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="text-center text-slate-500 text-sm py-4 border-t border-slate-800">
                    <p>เอกสารนี้สร้างโดยระบบ <span className="text-emerald-400 font-medium">Plook Arai Dee</span></p>
                    <p>สร้างเมื่อวันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
}
