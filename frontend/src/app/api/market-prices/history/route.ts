import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/market-prices/history
 * ดึงประวัติราคาของสินค้า
 * 
 * Query params:
 * - productId: ID ของสินค้า (required)
 * - days: จำนวนวันย้อนหลัง (default: 30)
 * - source: ชื่อแหล่งข้อมูล (optional, filter by source)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productIdStr = searchParams.get('productId');
        const days = parseInt(searchParams.get('days') || '30');
        const source = searchParams.get('source');

        if (!productIdStr) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        const productId = parseInt(productIdStr);
        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'productId must be a number' },
                { status: 400 }
            );
        }

        // Get product info
        const product = await db.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Build query
        const whereClause: any = {
            productId,
            dateRecorded: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (source) {
            whereClause.sourceName = source;
        }

        // Get price history
        const priceHistory = await db.marketPrice.findMany({
            where: whereClause,
            orderBy: {
                dateRecorded: 'asc',
            },
            select: {
                id: true,
                priceMin: true,
                priceMax: true,
                sourceName: true,
                dateRecorded: true,
            },
        });

        // Group by date and source for chart data
        const chartData = priceHistory.map((price) => ({
            date: price.dateRecorded.toISOString().split('T')[0],
            priceMin: Number(price.priceMin),
            priceMax: Number(price.priceMax),
            priceAvg: (Number(price.priceMin) + Number(price.priceMax)) / 2,
            source: price.sourceName,
        }));

        // Calculate statistics
        const allPrices = priceHistory.flatMap((p) => [Number(p.priceMin), Number(p.priceMax)]);
        const stats = {
            min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
            max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
            avg: allPrices.length > 0
                ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
                : 0,
            count: priceHistory.length,
        };

        // Calculate trend (compare last week to previous week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentPrices = priceHistory.filter(p => p.dateRecorded >= oneWeekAgo);
        const olderPrices = priceHistory.filter(p => p.dateRecorded < oneWeekAgo);

        let trend = 'stable';
        let changePercent = 0;

        if (recentPrices.length > 0 && olderPrices.length > 0) {
            const recentAvg = recentPrices.reduce((sum, p) =>
                sum + (Number(p.priceMin) + Number(p.priceMax)) / 2, 0) / recentPrices.length;
            const olderAvg = olderPrices.reduce((sum, p) =>
                sum + (Number(p.priceMin) + Number(p.priceMax)) / 2, 0) / olderPrices.length;

            changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
            trend = changePercent > 3 ? 'up' : changePercent < -3 ? 'down' : 'stable';
        }

        // Get unique sources
        const sources = [...new Set(priceHistory.map(p => p.sourceName))];

        return NextResponse.json({
            product: {
                id: product.id,
                name: product.name,
                category: product.category,
            },
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                days,
            },
            sources,
            stats: {
                ...stats,
                avg: Math.round(stats.avg * 100) / 100,
            },
            trend: {
                direction: trend,
                changePercent: Math.round(changePercent * 100) / 100,
            },
            chartData,
            rawData: priceHistory.map(p => ({
                id: Number(p.id),
                priceMin: Number(p.priceMin),
                priceMax: Number(p.priceMax),
                source: p.sourceName,
                date: p.dateRecorded.toISOString(),
            })),
        });

    } catch (error) {
        console.error('Error fetching price history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch price history' },
            { status: 500 }
        );
    }
}
