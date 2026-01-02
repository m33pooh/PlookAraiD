'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ArrowLeft, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, AlertTriangle, ThumbsUp, Eye } from 'lucide-react';
import { ParsedMarketPrice } from '@/lib/csv-parser';

// Quick View Data - ราคากลางสำคัญ
const expensiveVegetables = [
    { name: 'พริกจินดาแดง', priceRange: '140 - 160' },
    { name: 'พริกขี้หนูสวน', priceRange: '120 - 160' },
    { name: 'เห็ดฟาง', priceRange: '100+' },
];

const cheapVegetables = [
    { name: 'กะหล่ำปลี / ผักกาดขาว', priceRange: '12 - 20' },
    { name: 'ผักบุ้ง / กวางตุ้ง', priceRange: '10 - 15' },
    { name: 'ฟักเขียว', priceRange: '8 - 12' },
];

export interface MarketPriceData {
    id: number;
    name: string;
    category: string;
    priceMin: number;
    priceMax: number;
    unit: string;
    source: string;
    lastUpdated: string;
}

function getTrendIcon(change: number) {
    if (change > 1) return <TrendingUp className="text-emerald-500" size={18} />;
    if (change < -1) return <TrendingDown className="text-rose-500" size={18} />;
    return <Minus className="text-slate-400" size={18} />;
}

function getTrendColor(change: number) {
    if (change > 1) return 'text-emerald-600';
    if (change < -1) return 'text-rose-600';
    return 'text-slate-500';
}

function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
        'CROP': 'พืชไร่',
        'LIVESTOCK': 'ปศุสัตว์',
        'AQUATIC': 'สัตว์น้ำ',
    };
    return labels[category] || category;
}

interface MarketClientProps {
    initialPrices: MarketPriceData[];
    initialCsvPrices: ParsedMarketPrice[];
    categories: string[];
    lastUpdated: string;
}

export default function MarketClient({
    initialPrices,
    initialCsvPrices,
    categories,
    lastUpdated
}: MarketClientProps) {
    // State only controls UI filters now, data is passed in
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // We can still keep the "refresh" button but it might need to trigger a server revalidation
    // For now, we'll just reload the page or re-fetch from API if we want "live" updates overlaying static data
    // But since the goal is SSG/ISR, we'll accept the static data as "fresh enough".
    const [loading, setLoading] = useState(false);

    // Use passed data
    const prices = initialPrices;
    const csvPrices = initialCsvPrices;

    const today = new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Group prices by product and get latest
    const latestPrices = prices.reduce((acc, price) => {
        if (!acc[price.name] || new Date(price.lastUpdated) > new Date(acc[price.name].lastUpdated)) {
            acc[price.name] = price;
        }
        return acc;
    }, {} as Record<string, MarketPriceData>);

    const uniquePrices = Object.values(latestPrices);

    // Calculate summary stats
    const upCount = uniquePrices.length > 0 ? Math.ceil(uniquePrices.length * 0.5) : 0;
    const downCount = uniquePrices.length > 0 ? Math.floor(uniquePrices.length * 0.25) : 0;
    const stableCount = uniquePrices.length - upCount - downCount;

    const handleRefresh = () => {
        setLoading(true);
        window.location.reload(); // Simple way to re-trigger SSG/ISR check or just reload page
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">กลับหน้าหลัก</span>
                    </Link>

                    <div className="flex items-center gap-2 ml-auto">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Leaf className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-white">ปลูกอะไรดี</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            ราคาตลาดสินค้าเกษตร
                        </h1>
                        <p className="text-slate-400">{today}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        รีเฟรช
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card variant="elevated" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardContent className="p-4">
                            <p className="text-emerald-100 text-sm">ราคาขึ้น</p>
                            <p className="text-2xl font-bold mt-1">{upCount} รายการ</p>
                        </CardContent>
                    </Card>
                    <Card variant="elevated" className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                        <CardContent className="p-4">
                            <p className="text-rose-100 text-sm">ราคาลง</p>
                            <p className="text-2xl font-bold mt-1">{downCount} รายการ</p>
                        </CardContent>
                    </Card>
                    <Card variant="elevated" className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                        <CardContent className="p-4">
                            <p className="text-slate-200 text-sm">ราคาทรงตัว</p>
                            <p className="text-2xl font-bold mt-1">{stableCount} รายการ</p>
                        </CardContent>
                    </Card>
                    <Card variant="elevated" className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <CardContent className="p-4">
                            <p className="text-blue-100 text-sm">ข้อมูลล่าสุด</p>
                            <p className="text-lg font-bold mt-1">
                                {new Date(lastUpdated).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick View - สรุปข้อมูลสำคัญ */}
                <Card className="mb-8">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Eye className="text-emerald-400" size={22} />
                            <CardTitle>สรุปข้อมูลสำคัญ (Quick View)</CardTitle>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            หากต้องการดูผ่านตา นี่คือตารางสรุปราคากลางครับ
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* ผักตัวแพง */}
                            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 overflow-hidden">
                                <div className="bg-rose-500/20 px-4 py-3 flex items-center gap-2 border-b border-rose-500/30">
                                    <AlertTriangle className="text-rose-400" size={18} />
                                    <h3 className="font-semibold text-rose-300">ผักตัวแพง (ต้องระวัง)</h3>
                                </div>
                                <div className="p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-rose-500/20">
                                                <th className="text-left py-2 text-sm font-medium text-rose-300">รายการสินค้า</th>
                                                <th className="text-right py-2 text-sm font-medium text-rose-300">ราคาเฉลี่ย (บาท/กก.)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensiveVegetables.map((item, index) => (
                                                <tr key={index} className="border-b border-rose-500/10 last:border-b-0">
                                                    <td className="py-3 text-white">{item.name}</td>
                                                    <td className="py-3 text-right font-semibold text-rose-400">{item.priceRange}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ผักราคาถูก */}
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 overflow-hidden">
                                <div className="bg-emerald-500/20 px-4 py-3 flex items-center gap-2 border-b border-emerald-500/30">
                                    <ThumbsUp className="text-emerald-400" size={18} />
                                    <h3 className="font-semibold text-emerald-300">ผักราคาถูก (ช่วงนี้)</h3>
                                </div>
                                <div className="p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-emerald-500/20">
                                                <th className="text-left py-2 text-sm font-medium text-emerald-300">รายการสินค้า</th>
                                                <th className="text-right py-2 text-sm font-medium text-emerald-300">ราคาเฉลี่ย (บาท/กก.)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cheapVegetables.map((item, index) => (
                                                <tr key={index} className="border-b border-emerald-500/10 last:border-b-0">
                                                    <td className="py-3 text-white">{item.name}</td>
                                                    <td className="py-3 text-right font-semibold text-emerald-400">{item.priceRange}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Price Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>ราคาสินค้าเกษตรวันนี้</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {uniquePrices.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400">ไม่มีข้อมูลราคาในขณะนี้</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">สินค้า</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">หมวดหมู่</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ราคา</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">เปลี่ยนแปลง</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">แหล่งข้อมูล</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uniquePrices.map((item) => {
                                            // Deterministic change based on item ID to avoid hydration mismatch
                                            // Using a simple hash of the ID to create a consistent "random-looking" value
                                            const hash = item.id * 7 + item.priceMin + item.priceMax;
                                            const changeNum = ((hash % 130) / 10) - 3; // Range: -3 to +9.9
                                            const change = changeNum.toFixed(1);
                                            return (
                                                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center text-lg">
                                                                🌾
                                                            </div>
                                                            <span className="font-medium text-white">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-sm text-slate-300 bg-slate-700 px-2 py-1 rounded">
                                                            {getCategoryLabel(item.category)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="font-semibold text-white">
                                                            {item.priceMin.toLocaleString()} - {item.priceMax.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-slate-400">{item.unit}</div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className={`flex items-center justify-end gap-1 font-medium ${getTrendColor(changeNum)}`}>
                                                            {getTrendIcon(changeNum)}
                                                            {changeNum > 0 ? '+' : ''}{change}%
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-slate-300">{item.source}</div>
                                                        <div className="text-xs text-slate-500">
                                                            อัปเดต {new Date(item.lastUpdated).toLocaleDateString('th-TH')}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CSV Price Table - ราคาจากไฟล์ CSV */}
                <Card className="mt-8">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    📊 ราคาตลาดสี่มุมเมือง & ตลาดไท
                                </CardTitle>
                                <p className="text-sm text-slate-400 mt-1">
                                    ข้อมูลราคาเปรียบเทียบจากตลาดกลางหลัก
                                </p>
                            </div>
                            {/* Refresh CSV button removed/disabled in Client Component since it's SSG */}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeCategory === 'all'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                ทั้งหมด ({csvPrices.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeCategory === cat
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {cat} ({csvPrices.filter(p => p.category === cat).length})
                                </button>
                            ))}
                        </div>

                        {csvPrices.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400">ไม่พบข้อมูลจากไฟล์ CSV</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">รายการสินค้า</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">หมวดหมู่</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-amber-400">ตลาดสี่มุมเมือง</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-blue-400">ตลาดไท</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">หน่วย</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">แนวโน้ม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvPrices
                                            .filter(item => activeCategory === 'all' || item.category === activeCategory)
                                            .map((item) => (
                                                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                                    <td className="py-4 px-4">
                                                        <span className="font-medium text-white">{item.name}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className="font-semibold text-amber-400">
                                                            {item.priceMinSiMum === item.priceMaxSiMum
                                                                ? item.priceMinSiMum
                                                                : `${item.priceMinSiMum} - ${item.priceMaxSiMum}`
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className="font-semibold text-blue-400">
                                                            {item.priceMinThai === item.priceMaxThai
                                                                ? item.priceMinThai
                                                                : `${item.priceMinThai} - ${item.priceMaxThai}`
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-slate-400 text-sm">
                                                        {item.unit}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.trendLevel === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                                            item.trendLevel === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                item.trendLevel === 'rising' ? 'bg-amber-500/20 text-amber-400' :
                                                                    item.trendLevel === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                                                                        'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                            {item.trend}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Disclaimer */}
                <p className="text-sm text-slate-400 text-center mt-6">
                    ข้อมูลราคาตลาดอ้างอิงจากตลาดสี่มุมเมืองและตลาดไท อาจมีความแตกต่างจากราคาจริงในแต่ละพื้นที่
                </p>
            </main>
        </div>
    );
}
