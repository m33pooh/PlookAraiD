
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialChart } from "@/components/analytics/FinancialChart";
import { YieldChart } from "@/components/analytics/YieldChart";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Sprout } from "lucide-react";

interface AnalyticsData {
    yieldHistory: any[];
    financialData: any[];
    cropPerformance: any[];
    totals: {
        revenue: number;
        cost: number;
        profit: number;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/analytics/farmer");
                if (!res.ok) throw new Error("Failed to fetch data");
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return <div className="p-8">Failed to load analytics data.</div>;
    }

    return (
        <div className="space-y-6  p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Farm Analytics</h1>
                <p className="text-muted-foreground">
                    Insights into your production, costs, and profitability.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{data.totals.revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Estimated from contracts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{data.totals.cost.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Based on crop standards</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${data.totals.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ฿{data.totals.profit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Revenue - Cost</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.cropPerformance.length}</div>
                        <p className="text-xs text-muted-foreground">Varieties planted</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Financial Performance</CardTitle>
                        <CardDescription>
                            Revenue vs Cost over time based on harvest dates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <FinancialChart data={data.financialData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Yield History</CardTitle>
                        <CardDescription>
                            Total harvest amount (kg) by date.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <YieldChart data={data.yieldHistory} />
                    </CardContent>
                </Card>
            </div>

            {/* Crop Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Crop Profitability</CardTitle>
                    <CardDescription>Per-crop breakdown of costs and revenue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.cropPerformance.map((crop: any) => (
                            <div key={crop.name} className="flex items-center">
                                <div className="w-1/4 font-medium">{crop.name}</div>
                                <div className="w-full">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Profit: ฿{crop.profit.toLocaleString()}</span>
                                        <span className="text-muted-foreground">Yield: {crop.yield.toLocaleString()} kg</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.max(0, Math.min(100, (crop.profit / data.totals.profit) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
