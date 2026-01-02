import { Suspense } from 'react';
import Link from 'next/link';
import { SearchFilters } from '@/components/features/SearchFilters';
import { CropListWithPanel } from '@/components/features/CropListWithPanel';
import { Crop, DemandLevel, PriceTrend } from '@/types';
import { Leaf, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';

async function getRecommendedCrops(searchParams: {
    lat?: string;
    lng?: string;
    water?: string;
    size?: string;
    category?: string;
}): Promise<(Crop & { matchScore: number })[]> {
    try {
        // Fetch products with their latest market prices
        const products = await db.product.findMany({
            where: searchParams.category && searchParams.category !== 'ALL'
                ? { category: searchParams.category as 'CROP' | 'LIVESTOCK' | 'AQUATIC' }
                : undefined,
            include: {
                marketPrices: {
                    orderBy: { dateRecorded: 'desc' },
                    take: 2, // Get latest 2 for trend calculation
                },
                buyRequests: {
                    where: { status: 'OPEN' },
                },
            },
        });

        // Transform to Crop type with market info
        const crops: (Crop & { matchScore: number })[] = products.map((product) => {
            const latestPrice = product.marketPrices[0];
            const previousPrice = product.marketPrices[1];

            // Calculate price trend
            let trend: PriceTrend = 'stable';
            if (latestPrice && previousPrice) {
                const priceChange = Number(latestPrice.priceMax) - Number(previousPrice.priceMax);
                if (priceChange > 0) trend = 'up';
                else if (priceChange < 0) trend = 'down';
            }

            // Calculate market demand based on open buy requests
            let marketDemand: DemandLevel = 'low';
            if (product.buyRequests.length >= 3) marketDemand = 'high';
            else if (product.buyRequests.length >= 1) marketDemand = 'medium';

            // Calculate match score (simplified algorithm)
            let matchScore = 70; // Base score
            if (marketDemand === 'high') matchScore += 15;
            else if (marketDemand === 'medium') matchScore += 8;
            if (trend === 'up') matchScore += 10;
            if (latestPrice) matchScore += 5;

            // Determine price unit based on product
            const unit = product.name.includes('ข้าว') || product.name.includes('อ้อย')
                ? 'บาท/ตัน'
                : 'บาท/กก.';

            return {
                id: product.id,
                name: product.name,
                category: product.category,
                growthDurationDays: product.growthDurationDays,
                imageUrl: product.imageUrl || undefined,
                marketDemand,
                currentPrice: {
                    min: latestPrice ? Number(latestPrice.priceMin) : 0,
                    max: latestPrice ? Number(latestPrice.priceMax) : 0,
                    unit,
                    trend,
                },
                matchScore: Math.min(matchScore, 100),
            };
        });

        // Sort by match score
        return crops.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
        console.error('Error fetching crops:', error);
        return [];
    }
}

function LoadingCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4 animate-pulse">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-700 rounded-xl" />
                        <div className="flex-1">
                            <div className="h-6 bg-slate-700 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-slate-600 rounded w-1/2 mb-4" />
                            <div className="h-5 bg-slate-700 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

async function CropResults({ searchParams }: { searchParams: Record<string, string | undefined> }) {
    const crops = await getRecommendedCrops(searchParams);

    if (crops.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="text-slate-500" size={32} />
                </div>
                <p className="text-slate-400 text-lg">ไม่พบพืชที่เหมาะสมกับเงื่อนไขนี้</p>
                <p className="text-slate-500 text-sm mt-2">ลองปรับตัวกรองใหม่อีกครั้ง</p>
            </div>
        );
    }

    return <CropListWithPanel crops={crops} />;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{
        lat?: string;
        lng?: string;
        water?: string;
        size?: string;
        category?: string;
    }>;
}) {
    const params = await searchParams;
    const { lat, lng, water, size, category } = params;

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
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        ค้นหาพืชที่เหมาะสม
                    </h1>
                    <p className="text-slate-400">
                        {lat && lng ? (
                            <>พิกัด: {lat}, {lng} • </>
                        ) : null}
                        {water && <>แหล่งน้ำ: {water} • </>}
                        {size && <>ขนาด: {size} ไร่</>}
                        {!lat && !lng && !water && !size && 'เลือกเงื่อนไขเพื่อค้นหาพืชที่เหมาะกับพื้นที่ของคุณ'}
                    </p>
                </div>

                {/* Filters */}
                <section className="mb-8">
                    <Suspense fallback={<div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />}>
                        <SearchFilters
                            initialValues={{ lat, lng, water, size, category }}
                        />
                    </Suspense>
                </section>

                {/* Results */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            ผลการแนะนำ
                        </h2>
                        <span className="text-sm text-slate-400">
                            เรียงตามความเหมาะสม
                        </span>
                    </div>

                    <Suspense fallback={<LoadingCards />}>
                        <CropResults searchParams={params} />
                    </Suspense>
                </section>
            </main>
        </div>
    );
}
