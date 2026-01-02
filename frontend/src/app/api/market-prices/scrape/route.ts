import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    scrapeSimummuangPrices,
    scrapeTalaadthaiPrices,
    scrapeAllMarketPrices,
    categorizeProduct,
    ScrapedPrice,
    ScrapeResult
} from '@/lib/market-scraper';

/**
 * POST /api/market-prices/scrape
 * ดึงราคาจากตลาดออนไลน์และบันทึกลง database
 * 
 * Query params:
 * - source: 'simummuang' | 'talaadthai' | 'all' (default: 'all')
 */
export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const source = searchParams.get('source') || 'all';

        console.log(`🔄 Starting price scrape from: ${source}`);

        let results: ScrapeResult[] = [];

        switch (source) {
            case 'simummuang':
                results = [await scrapeSimummuangPrices()];
                break;
            case 'talaadthai':
                results = [await scrapeTalaadthaiPrices()];
                break;
            case 'all':
            default:
                results = await scrapeAllMarketPrices();
                break;
        }

        // Process and save to database
        let totalSaved = 0;
        const errors: string[] = [];
        const savedItems: { name: string; source: string }[] = [];

        for (const result of results) {
            if (!result.success) {
                errors.push(`${result.source}: ${result.error}`);
                continue;
            }

            for (const item of result.data) {
                try {
                    // Try to find matching product in database
                    const product = await findOrCreateProduct(item);

                    if (product) {
                        // Check if price for today already exists
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const existingPrice = await db.marketPrice.findFirst({
                            where: {
                                productId: product.id,
                                sourceName: item.source,
                                dateRecorded: {
                                    gte: today,
                                },
                            },
                        });

                        if (existingPrice) {
                            // Update existing price
                            await db.marketPrice.update({
                                where: { id: existingPrice.id },
                                data: {
                                    priceMin: item.priceMin,
                                    priceMax: item.priceMax,
                                },
                            });
                        } else {
                            // Create new price record
                            await db.marketPrice.create({
                                data: {
                                    productId: product.id,
                                    sourceName: item.source,
                                    priceMin: item.priceMin,
                                    priceMax: item.priceMax,
                                    dateRecorded: item.dateRecorded,
                                },
                            });
                        }

                        totalSaved++;
                        savedItems.push({ name: item.name, source: item.source });
                    }
                } catch (err) {
                    console.error(`Error saving ${item.name}:`, err);
                }
            }
        }

        console.log(`✅ Scrape completed. Saved ${totalSaved} price records.`);

        return NextResponse.json({
            success: true,
            message: `ดึงข้อมูลสำเร็จ บันทึกราคา ${totalSaved} รายการ`,
            results: results.map(r => ({
                source: r.source,
                success: r.success,
                itemCount: r.itemCount,
                scrapedAt: r.scrapedAt,
                error: r.error,
            })),
            totalSaved,
            sampleItems: savedItems.slice(0, 10),
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('❌ Scrape Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/market-prices/scrape
 * Get scraping status/info (for debugging)
 */
export async function GET() {
    return NextResponse.json({
        sources: [
            {
                id: 'simummuang',
                name: 'ตลาดสี่มุมเมือง',
                url: 'https://www.simummuangmarket.com',
                description: 'ราคาผัก ผลไม้ สินค้าเกษตร',
            },
            {
                id: 'talaadthai',
                name: 'ตลาดไท',
                url: 'https://www.talaadthai.com',
                description: 'ราคาสินค้าเกษตรรายวัน พร้อมแนวโน้ม',
            },
        ],
        usage: {
            method: 'POST',
            queryParams: {
                source: "Optional. 'simummuang' | 'talaadthai' | 'all'. Default: 'all'",
            },
        },
    });
}

/**
 * Find or create product based on scraped name
 */
async function findOrCreateProduct(item: ScrapedPrice) {
    // First try exact match
    let product = await db.product.findFirst({
        where: {
            name: { equals: item.name, mode: 'insensitive' }
        },
    });

    if (product) return product;

    // Try partial match
    product = await db.product.findFirst({
        where: {
            name: { contains: item.name.split(' ')[0], mode: 'insensitive' }
        },
    });

    if (product) return product;

    // Try Thai name variants
    const nameVariants = [
        item.name,
        item.name.replace(/\s*\(.*?\)\s*/g, ''), // Remove parenthetical content
        item.name.split('/')[0].trim(), // Take first part if has /
    ];

    for (const variant of nameVariants) {
        product = await db.product.findFirst({
            where: {
                name: { contains: variant, mode: 'insensitive' }
            },
        });
        if (product) return product;
    }

    // If no match found and we want to auto-create products (optional)
    // For now, return null - products must exist in DB first
    return null;
}
