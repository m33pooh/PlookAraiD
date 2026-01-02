'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    BarChart3,
    DollarSign,
    Calendar,
    AlertTriangle,
    Target,
    Zap,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
} from 'lucide-react';

// Mock data for market analysis
const marketOverview = {
    totalCrops: 45,
    averagePriceChange: 2.3,
    lastUpdated: '10:30 น.',
    marketSentiment: 'bullish',
};

const priceAnalysis = [
    {
        id: 1,
        name: 'ข้าวหอมมะลิ',
        icon: '🌾',
        currentPrice: 15000,
        previousPrice: 14200,
        unit: 'บาท/ตัน',
        change: 5.6,
        trend: 'up',
        forecast: 'เพิ่มขึ้น',
        demand: 'สูง',
        supplyLevel: 'ต่ำ',
        priceRange: { min: 14000, max: 16000 },
        historicalData: [13500, 13800, 14200, 14500, 14800, 15000],
        insight: 'ความต้องการจากต่างประเทศเพิ่มขึ้น คาดว่าราคาจะขยับขึ้นอีก',
        riskLevel: 'low',
        bestSellPeriod: 'ม.ค. - มี.ค.',
    },
    {
        id: 2,
        name: 'ข้าวโพดเลี้ยงสัตว์',
        icon: '🌽',
        currentPrice: 9.5,
        previousPrice: 9.1,
        unit: 'บาท/กก.',
        change: 4.4,
        trend: 'up',
        forecast: 'ทรงตัว',
        demand: 'ปานกลาง',
        supplyLevel: 'ปานกลาง',
        priceRange: { min: 8.5, max: 10.5 },
        historicalData: [8.2, 8.5, 8.8, 9.0, 9.2, 9.5],
        insight: 'อุตสาหกรรมอาหารสัตว์มีความต้องการสม่ำเสมอ',
        riskLevel: 'medium',
        bestSellPeriod: 'ก.พ. - เม.ย.',
    },
    {
        id: 3,
        name: 'มันสำปะหลัง',
        icon: '🥔',
        currentPrice: 3.0,
        previousPrice: 3.2,
        unit: 'บาท/กก.',
        change: -6.3,
        trend: 'down',
        forecast: 'ลดลง',
        demand: 'ต่ำ',
        supplyLevel: 'สูง',
        priceRange: { min: 2.5, max: 3.5 },
        historicalData: [3.5, 3.4, 3.3, 3.2, 3.1, 3.0],
        insight: 'ผลผลิตออกสู่ตลาดมาก ทำให้ราคาปรับตัวลดลง',
        riskLevel: 'high',
        bestSellPeriod: 'มี.ค. - พ.ค.',
    },
    {
        id: 4,
        name: 'ยางแผ่นดิบ',
        icon: '🌿',
        currentPrice: 52,
        previousPrice: 50,
        unit: 'บาท/กก.',
        change: 4.0,
        trend: 'up',
        forecast: 'เพิ่มขึ้น',
        demand: 'สูง',
        supplyLevel: 'ต่ำ',
        priceRange: { min: 48, max: 58 },
        historicalData: [45, 47, 48, 50, 51, 52],
        insight: 'ความต้องการจากอุตสาหกรรมยานยนต์เพิ่มขึ้น',
        riskLevel: 'low',
        bestSellPeriod: 'ธ.ค. - ก.พ.',
    },
    {
        id: 5,
        name: 'อ้อย',
        icon: '🍬',
        currentPrice: 1050,
        previousPrice: 1100,
        unit: 'บาท/ตัน',
        change: -4.5,
        trend: 'down',
        forecast: 'ทรงตัว',
        demand: 'ปานกลาง',
        supplyLevel: 'สูง',
        priceRange: { min: 950, max: 1150 },
        historicalData: [1120, 1100, 1080, 1070, 1060, 1050],
        insight: 'ราคาน้ำตาลโลกปรับตัวลง กระทบราคาอ้อยในประเทศ',
        riskLevel: 'medium',
        bestSellPeriod: 'พ.ย. - ม.ค.',
    },
    {
        id: 6,
        name: 'ปาล์มน้ำมัน',
        icon: '🌴',
        currentPrice: 6.2,
        previousPrice: 6.0,
        unit: 'บาท/กก.',
        change: 3.3,
        trend: 'up',
        forecast: 'เพิ่มขึ้น',
        demand: 'สูง',
        supplyLevel: 'ปานกลาง',
        priceRange: { min: 5.5, max: 7.5 },
        historicalData: [5.5, 5.7, 5.8, 6.0, 6.1, 6.2],
        insight: 'ราคาน้ำมันพืชปรับตัวขึ้น หนุนราคาปาล์ม',
        riskLevel: 'low',
        bestSellPeriod: 'เม.ย. - มิ.ย.',
    },
];

const contracts = [
    {
        id: 1,
        crop: 'ข้าวหอมมะลิ',
        buyer: 'บริษัท ข้าวไทยเกษตร จำกัด',
        guaranteedPrice: 14500,
        marketPrice: 15000,
        quantity: '10 ตัน',
        deadline: '15 มี.ค. 2025',
        advantage: -500,
    },
    {
        id: 2,
        crop: 'ข้าวโพดเลี้ยงสัตว์',
        buyer: 'บริษัท อาหารสัตว์ ABC',
        guaranteedPrice: 9.8,
        marketPrice: 9.5,
        quantity: '20 ตัน',
        deadline: '20 มี.ค. 2025',
        advantage: 0.3,
    },
    {
        id: 3,
        crop: 'มันสำปะหลัง',
        buyer: 'โรงงานแป้งมัน XYZ',
        guaranteedPrice: 3.2,
        marketPrice: 3.0,
        quantity: '50 ตัน',
        deadline: '1 เม.ย. 2025',
        advantage: 0.2,
    },
];

const marketTrends = [
    {
        period: '1 สัปดาห์',
        priceUp: 5,
        priceDown: 2,
        stable: 3,
    },
    {
        period: '1 เดือน',
        priceUp: 8,
        priceDown: 4,
        stable: 3,
    },
    {
        period: '3 เดือน',
        priceUp: 10,
        priceDown: 3,
        stable: 2,
    },
];

function getTrendIcon(trend: string) {
    switch (trend) {
        case 'up':
            return <TrendingUp className="text-emerald-500" size={18} />;
        case 'down':
            return <TrendingDown className="text-rose-500" size={18} />;
        default:
            return <Minus className="text-slate-400" size={18} />;
    }
}

function getTrendColor(trend: string) {
    switch (trend) {
        case 'up':
            return 'text-emerald-500';
        case 'down':
            return 'text-rose-500';
        default:
            return 'text-slate-400';
    }
}

function getRiskBadge(risk: string) {
    switch (risk) {
        case 'low':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">ความเสี่ยงต่ำ</span>;
        case 'high':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-500/20 text-rose-400">ความเสี่ยงสูง</span>;
        default:
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">ความเสี่ยงปานกลาง</span>;
    }
}

function getDemandBadge(demand: string) {
    switch (demand) {
        case 'สูง':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">{demand}</span>;
        case 'ต่ำ':
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-500/20 text-rose-400">{demand}</span>;
        default:
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">{demand}</span>;
    }
}

function MiniChart({ data, trend }: { data: number[]; trend: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const chartColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#64748b';

    return (
        <div className="flex items-end gap-1 h-10">
            {data.map((value, index) => {
                const height = ((value - min) / range) * 100 + 10;
                return (
                    <div
                        key={index}
                        className="w-2 rounded-t transition-all"
                        style={{
                            height: `${height}%`,
                            backgroundColor: chartColor,
                            opacity: 0.3 + (index / data.length) * 0.7,
                        }}
                    />
                );
            })}
        </div>
    );
}

export default function MarketAnalysisPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<typeof priceAnalysis[0] | null>(null);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const categories = ['all', 'พืชไร่', 'ยางพารา', 'พืชน้ำมัน'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        วิเคราะห์ตลาดและราคา
                    </h1>
                    <p className="text-slate-400 mt-1">
                        ข้อมูลราคา แนวโน้ม และคำแนะนำสำหรับการตัดสินใจปลูกพืช
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    อัปเดตข้อมูล
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-600 to-teal-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">ราคาขึ้น</p>
                                <p className="text-3xl font-bold text-white mt-1">5</p>
                                <p className="text-emerald-200 text-xs mt-1">รายการ</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <ArrowUpRight className="text-white" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-600 to-pink-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-rose-100 text-sm">ราคาลง</p>
                                <p className="text-3xl font-bold text-white mt-1">2</p>
                                <p className="text-rose-200 text-xs mt-1">รายการ</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <ArrowDownRight className="text-white" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-600 to-orange-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm">เปลี่ยนแปลงเฉลี่ย</p>
                                <p className="text-3xl font-bold text-white mt-1">+{marketOverview.averagePriceChange}%</p>
                                <p className="text-amber-200 text-xs mt-1">จากสัปดาห์ที่แล้ว</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <BarChart3 className="text-white" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">อัปเดตล่าสุด</p>
                                <p className="text-3xl font-bold text-white mt-1">{marketOverview.lastUpdated}</p>
                                <p className="text-blue-200 text-xs mt-1">วันนี้</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Clock className="text-white" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedCategory === category
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {category === 'all' ? 'ทั้งหมด' : category}
                    </button>
                ))}
            </div>

            {/* Price Analysis Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priceAnalysis.map((item) => (
                    <Card
                        key={item.id}
                        variant="elevated"
                        className="cursor-pointer hover:border-emerald-500/50 transition-all"
                        onClick={() => setSelectedCrop(selectedCrop?.id === item.id ? null : item)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{item.name}</h3>
                                        <p className="text-sm text-slate-400">{item.unit}</p>
                                    </div>
                                </div>
                                {getRiskBadge(item.riskLevel)}
                            </div>

                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {item.currentPrice.toLocaleString()}
                                    </p>
                                    <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                                        {getTrendIcon(item.trend)}
                                        <span className="text-sm font-medium">
                                            {item.change > 0 ? '+' : ''}{item.change}%
                                        </span>
                                    </div>
                                </div>
                                <MiniChart data={item.historicalData} trend={item.trend} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <span className="text-slate-400">ความต้องการ</span>
                                    <div className="mt-1">{getDemandBadge(item.demand)}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <span className="text-slate-400">ช่วงขายดี</span>
                                    <p className="text-white font-medium mt-1">{item.bestSellPeriod}</p>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedCrop?.id === item.id && (
                                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 animate-fade-in">
                                    <div className="flex items-start gap-2 text-sm">
                                        <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                        <p className="text-slate-300">{item.insight}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <span className="text-slate-400 text-sm">ราคาต่ำสุด</span>
                                            <p className="text-white font-bold">{item.priceRange.min.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <span className="text-slate-400 text-sm">ราคาสูงสุด</span>
                                            <p className="text-white font-bold">{item.priceRange.max.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <span className="text-slate-400 text-sm">คาดการณ์แนวโน้ม</span>
                                        <p className={`font-bold ${item.forecast === 'เพิ่มขึ้น' ? 'text-emerald-400' :
                                                item.forecast === 'ลดลง' ? 'text-rose-400' : 'text-amber-400'
                                            }`}>
                                            {item.forecast}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Contract Opportunities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Target className="text-emerald-500" size={24} />
                        <div>
                            <CardTitle>โอกาสสัญญารับซื้อ</CardTitle>
                            <CardDescription>เปรียบเทียบราคาประกันกับราคาตลาด</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">พืช</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">ผู้รับซื้อ</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ราคาประกัน</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ราคาตลาด</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ส่วนต่าง</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ปริมาณ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map((contract) => (
                                    <tr key={contract.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-white">{contract.crop}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-slate-300">{contract.buyer}</span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="font-semibold text-emerald-400">
                                                {contract.guaranteedPrice.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-slate-300">
                                                {contract.marketPrice.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className={`font-medium ${contract.advantage > 0 ? 'text-emerald-400' :
                                                    contract.advantage < 0 ? 'text-rose-400' : 'text-slate-400'
                                                }`}>
                                                {contract.advantage > 0 ? '+' : ''}{contract.advantage}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-slate-300">{contract.quantity}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Market Alerts */}
            <Card className="border-amber-500/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={24} />
                        <div>
                            <CardTitle className="text-amber-400">แจ้งเตือนตลาด</CardTitle>
                            <CardDescription>ข้อมูลสำคัญที่ควรทราบ</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Zap className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-white font-medium">ราคามันสำปะหลังปรับตัวลดลง</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    ผลผลิตออกสู่ตลาดมาก ควรพิจารณาทำสัญญาขายล่วงหน้า หรือเก็บรอขายในช่วงราคาดี
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-white font-medium">ข้าวหอมมะลิราคาดี</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    ความต้องการจากต่างประเทศเพิ่มขึ้น โดยเฉพาะตลาดจีนและตะวันออกกลาง
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Calendar className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-white font-medium">สัญญารับซื้อข้าวโพดมีราคาดีกว่าตลาด</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    บริษัท อาหารสัตว์ ABC รับซื้อในราคา 9.8 บาท/กก. ซึ่งสูงกว่าราคาตลาดปัจจุบัน
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Disclaimer */}
            <p className="text-sm text-slate-500 text-center">
                ข้อมูลนี้เป็นการวิเคราะห์เบื้องต้นเพื่อประกอบการตัดสินใจ ราคาจริงอาจแตกต่างตามพื้นที่และคุณภาพผลผลิต
            </p>
        </div>
    );
}
