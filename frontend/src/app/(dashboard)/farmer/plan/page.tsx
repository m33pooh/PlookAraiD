'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
    Clock,
    CloudSun,
    Droplets,
    Wind,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Types
interface Product {
    id: number;
    name: string;
    growthDurationDays: number;
    baseCostPerRai: number;
    marketPrices: { priceMin: number; priceMax: number }[];
}

interface Farm {
    id: string;
    name: string;
    areaSize: number;
    locationLat: number;
    locationLng: number;
    cultivations: Cultivation[];
}

interface Cultivation {
    id: string;
    status: string;
    startDate: string;
    expectedHarvestDate: string;
    product: Product;
    costDetails: any;
    activitySchedule: any;
}

interface WeatherData {
    daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
    };
}

export default function MyPlanPage() {
    const searchParams = useSearchParams();
    const preselectedProductId = searchParams.get('productId');

    const [loading, setLoading] = useState(true);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activePlan, setActivePlan] = useState<Cultivation | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Form State for New Plan
    const [selectedFarmId, setSelectedFarmId] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId || '');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    // Update selected product when preselectedProductId is available
    useEffect(() => {
        if (preselectedProductId && !selectedProductId) {
            setSelectedProductId(preselectedProductId);
        }
    }, [preselectedProductId]);


    useEffect(() => {
        if (activePlan) {
            const farm = farms.find(f => f.cultivations.some(c => c.id === activePlan.id));
            if (farm) {
                fetchWeather(farm.locationLat, farm.locationLng);
            }
        }
    }, [activePlan, farms]);

    const fetchData = async () => {
        try {
            const [farmsRes, productsRes] = await Promise.all([
                fetch('/api/farms'),
                fetch('/api/products')
            ]);
            const farmsData = await farmsRes.json();
            const productsData = await productsRes.json();

            setFarms(farmsData);
            setProducts(productsData);

            // Check for active plan
            const active = farmsData.flatMap((f: Farm) => f.cultivations).find((c: Cultivation) => ['PLANNING', 'GROWING'].includes(c.status));
            if (active) {
                setActivePlan(active);
            } else if (farmsData.length > 0) {
                setSelectedFarmId(farmsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeather = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            setWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    };

    const handleCreatePlan = async () => {
        const farm = farms.find(f => f.id === selectedFarmId);
        const product = products.find(p => p.id === parseInt(selectedProductId));

        if (!farm || !product) return;

        // Calculate Schedule
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + product.growthDurationDays);

        const schedule = [
            { date: startDate, activity: "เริ่มปลูก", provider: "ตนเอง", cost: 0, status: "pending" },
            { date: new Date(start.getTime() + 30 * 86400000).toISOString().split('T')[0], activity: "ใส่ปุ๋ยระยะแรก", provider: "ตนเอง", cost: 500, status: "pending" },
            { date: end.toISOString().split('T')[0], activity: "เก็บเกี่ยว", provider: "บริการรถเกี่ยว", cost: 2000, status: "pending" }
        ];

        // Calculate Costs
        const costPerRai = Number(product.baseCostPerRai) || 3000;
        const totalCost = costPerRai * Number(farm.areaSize);
        const estimatedYield = 800 * Number(farm.areaSize); // Mock yield 800kg/rai
        const price = product.marketPrices[0]?.priceMin || 10;
        const revenue = estimatedYield * price;
        const profit = revenue - totalCost;

        const costDetails = {
            totalCost,
            revenue,
            profit,
            items: [
                { category: "วัสดุปลูก", amount: totalCost * 0.4 },
                { category: "ปุ๋ย/ยา", amount: totalCost * 0.3 },
                { category: "แรงงาน", amount: totalCost * 0.3 }
            ]
        };

        try {
            const res = await fetch('/api/cultivations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmId: farm.id,
                    productId: product.id,
                    startDate,
                    expectedHarvestDate: end.toISOString().split('T')[0],
                    estimatedYield,
                    costDetails,
                    activitySchedule: schedule,
                    status: 'PLANNING'
                })
            });

            if (res.ok) {
                const newPlan = await res.json();
                // Refresh data to show the new plan
                fetchData();
            }
        } catch (error) {
            console.error('Error creating plan:', error);
        }
    };


    if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

    if (!activePlan) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">สร้างแผนการผลิตใหม่</h2>
                <div className="space-y-4">
                    <div>
                        <Select
                            label="เลือกแปลงเกษตร"
                            value={selectedFarmId}
                            onChange={(e) => setSelectedFarmId(e.target.value)}
                            options={farms.map(f => ({
                                value: f.id,
                                label: `${f.name} (${f.areaSize} ไร่)`
                            }))}
                            placeholder="เลือกแปลงเกษตรของคุณ"
                        />
                    </div>
                    <div>
                        <Select
                            label="เลือกพืชที่จะปลูก"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            options={products.map(p => ({
                                value: p.id,
                                label: `${p.name} (ใช้เวลา ${p.growthDurationDays} วัน)`
                            }))}
                            placeholder="เลือกพืชที่ต้องการปลูก"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-200 mb-1.5 block">วันที่เริ่มปลูก</label>
                        <Input
                            type="date"
                            className="bg-slate-800 border-slate-700 text-white"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreatePlan} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4">
                        สร้างแผนการผลิต
                    </Button>
                </div>
            </div>
        );
    }

    // View Active Plan
    const financials = activePlan.costDetails || { revenue: 0, totalCost: 0, profit: 0, items: [] };
    const schedule = activePlan.activitySchedule || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {activePlan.product?.name || 'แผนการผลิต'}
                        <span className="text-sm font-normal bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                            {activePlan.status}
                        </span>
                    </h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-4 text-sm">
                        <span className="flex items-center"><Calendar size={14} className="mr-1" /> เริ่ม {new Date(activePlan.startDate).toLocaleDateString('th-TH')}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> เก็บเกี่ยว {new Date(activePlan.expectedHarvestDate).toLocaleDateString('th-TH')}</span>
                    </p>
                </div>
            </div>

            {/* Weather Widget */}
            {weather && weather.daily && (
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
                        <CloudSun className="text-blue-400" /> พยากรณ์อากาศล่วงหน้า (ณ แปลงเพาะปลูก)
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {weather.daily.time.slice(0, 5).map((date, idx) => (
                            <div key={idx} className="bg-slate-900/50 p-3 rounded-xl min-w-[120px] text-center border border-slate-700/50">
                                <p className="text-slate-400 text-xs mb-1">{date}</p>
                                <div className="flex justify-center my-2">
                                    {/* Simple icon logic based on code */}
                                    {weather.daily.precipitation_sum[idx] > 0 ? <Droplets className="text-cyan-400" /> : <CloudSun className="text-amber-400" />}
                                </div>
                                <p className="text-white font-bold">{Math.round(weather.daily.temperature_2m_max[idx])}°C</p>
                                <p className="text-slate-500 text-xs">{Math.round(weather.daily.temperature_2m_min[idx])}°C</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign size={64} className="text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1">กำไรสุทธิ (คาดการณ์)</p>
                    <h3 className="text-3xl font-bold text-emerald-400">฿{financials.profit?.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={64} className="text-sky-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1">รายรับรวม</p>
                    <h3 className="text-3xl font-bold text-sky-400">฿{financials.revenue?.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShoppingBag size={64} className="text-rose-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1">ต้นทุนรวม</p>
                    <h3 className="text-3xl font-bold text-rose-400">฿{financials.totalCost?.toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <Calendar className="mr-2 text-emerald-400" size={20} /> ตารางกิจกรรม (Activity Schedule)
                        </h3>
                        <div className="space-y-4">
                            {schedule.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                    <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                        {new Date(item.date).getDate()}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-semibold">{item.activity}</h4>
                                        <p className="text-slate-400 text-sm">{item.date} • {item.provider}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {item.provider !== "ตนเอง" && (
                                            <Link href={`/farmer/services?category=All&date=${item.date}&cultivationId=${activePlan.id}&keyword=${item.activity}`}>
                                                <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10">
                                                    จองบริการ
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <PieChart className="mr-2 text-amber-400" size={20} /> โครงสร้างต้นทุน
                    </h3>
                    <div className="space-y-4">
                        {financials.items?.map((c: any, idx: number) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">{c.category}</span>
                                    <span className="text-white font-medium">฿{c.amount.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full"
                                        style={{ width: `${(c.amount / financials.totalCost) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
