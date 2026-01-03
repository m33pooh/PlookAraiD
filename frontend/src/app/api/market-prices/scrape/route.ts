import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    scrapeSimummuangPrices,
    scrapeTalaadthaiPrices,
    scrapeAllMarketPrices,
    clearScrapeCache,
    hasCachedData,
    categorizeProduct,
    ScrapedPrice,
    ScrapeResult,
    ScraperErrorCode,
    SCRAPER_DEFAULT_CONFIG,
} from '@/lib/market-scraper';

// ============================================================================
// Types
// ============================================================================

interface ScrapeRequestBody {
    source?: 'simummuang' | 'talaadthai' | 'all';
    bypassCache?: boolean;
    config?: {
        maxRetries?: number;
        retryDelayMs?: number;
        timeoutMs?: number;
    };
}

interface ScrapeResponse {
    success: boolean;
    message: string;
    results: {
        source: string;
        success: boolean;
        itemCount: number;
        scrapedAt: Date;
        cached?: boolean;
        durationMs?: number;
        error?: string;
        errorCode?: ScraperErrorCode;
    }[];
    totalSaved: number;
    sampleItems?: { name: string; source: string; priceMin: number; priceMax: number }[];
    errors?: string[];
    performance: {
        totalDurationMs: number;
        cacheHits: number;
        cacheMisses: number;
    };
}

// ============================================================================
// POST /api/market-prices/scrape
// ============================================================================

/**
 * POST /api/market-prices/scrape
 * ดึงราคาจากตลาดออนไลน์และบันทึกลง database
 * 
 * Query params:
 * - source: 'simummuang' | 'talaadthai' | 'all' (default: 'all')
 * - bypass_cache: 'true' | 'false' (default: 'false')
 * 
 * Body (optional):
 * - config: { maxRetries, retryDelayMs, timeoutMs }
 */
export async function POST(req: NextRequest) {
    const requestStartTime = Date.now();

    try {
        // Parse query params
        const { searchParams } = new URL(req.url);
        const source = (searchParams.get('source') || 'all') as 'simummuang' | 'talaadthai' | 'all';
        const bypassCache = searchParams.get('bypass_cache') === 'true';

        // Parse optional body
        let customConfig = {};
        try {
            const body = await req.json() as ScrapeRequestBody;
            if (body.config) {
                customConfig = {
                    maxRetries: body.config.maxRetries,
                    retryDelayMs: body.config.retryDelayMs,
                    timeoutMs: body.config.timeoutMs,
                };
            }
        } catch {
            // No body or invalid JSON - use defaults
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔄 [${new Date().toISOString()}] Starting price scrape`);
        console.log(`   Source: ${source}`);
        console.log(`   Bypass Cache: ${bypassCache}`);
        console.log(`   Custom Config: ${JSON.stringify(customConfig)}`);
        console.log('='.repeat(60));

        // Execute scraping
        let results: ScrapeResult[] = [];
        let cacheHits = 0;
        let cacheMisses = 0;

        switch (source) {
            case 'simummuang':
                results = [await scrapeSimummuangPrices(customConfig, bypassCache)];
                break;
            case 'talaadthai':
                results = [await scrapeTalaadthaiPrices(customConfig, bypassCache)];
                break;
            case 'all':
            default:
                results = await scrapeAllMarketPrices(customConfig, bypassCache);
                break;
        }

        // Count cache hits/misses
        for (const result of results) {
            if (result.cached) {
                cacheHits++;
            } else {
                cacheMisses++;
            }
        }

        // Process and save to database
        let totalSaved = 0;
        const errors: string[] = [];
        const savedItems: { name: string; source: string; priceMin: number; priceMax: number }[] = [];

        for (const result of results) {
            if (!result.success) {
                const errorMsg = `${result.source}: ${result.error}${result.errorCode ? ` (${result.errorCode})` : ''}`;
                errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
                continue;
            }

            if (result.itemCount === 0) {
                console.warn(`⚠️ ${result.source}: No items found (site may use JS rendering)`);
                continue;
            }

            for (const item of result.data) {
                try {
                    // Validate price data
                    if (!isValidPrice(item)) {
                        console.warn(`⚠️ Invalid price data for ${item.name}: min=${item.priceMin}, max=${item.priceMax}`);
                        continue;
                    }

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
                            console.log(`📝 Updated: ${item.name} (${item.priceMin}-${item.priceMax})`);
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
                            console.log(`✅ Created: ${item.name} (${item.priceMin}-${item.priceMax})`);
                        }

                        totalSaved++;
                        savedItems.push({
                            name: item.name,
                            source: item.source,
                            priceMin: item.priceMin,
                            priceMax: item.priceMax,
                        });
                    }
                } catch (err) {
                    console.error(`❌ Error saving ${item.name}:`, err);
                }
            }
        }

        const totalDurationMs = Date.now() - requestStartTime;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Scrape completed in ${totalDurationMs}ms`);
        console.log(`   Saved: ${totalSaved} records`);
        console.log(`   Cache hits: ${cacheHits}, misses: ${cacheMisses}`);
        if (errors.length > 0) {
            console.log(`   Errors: ${errors.length}`);
        }
        console.log('='.repeat(60) + '\n');

        const response: ScrapeResponse = {
            success: true,
            message: `ดึงข้อมูลสำเร็จ บันทึกราคา ${totalSaved} รายการ`,
            results: results.map(r => ({
                source: r.source,
                success: r.success,
                itemCount: r.itemCount,
                scrapedAt: r.scrapedAt,
                cached: r.cached,
                durationMs: r.durationMs,
                error: r.error,
                errorCode: r.errorCode,
            })),
            totalSaved,
            sampleItems: savedItems.slice(0, 10),
            errors: errors.length > 0 ? errors : undefined,
            performance: {
                totalDurationMs,
                cacheHits,
                cacheMisses,
            },
        };

        return NextResponse.json(response);

    } catch (error) {
        const totalDurationMs = Date.now() - requestStartTime;
        console.error(`\n❌ [${new Date().toISOString()}] Scrape Error after ${totalDurationMs}ms:`, error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                performance: {
                    totalDurationMs,
                    cacheHits: 0,
                    cacheMisses: 0,
                },
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// GET /api/market-prices/scrape
// ============================================================================

/**
 * GET /api/market-prices/scrape
 * Get scraping status/info (for debugging)
 */
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        sources: [
            {
                id: 'simummuang',
                name: 'ตลาดสี่มุมเมือง',
                url: 'https://www.simummuangmarket.com',
                description: 'ราคาผัก ผลไม้ สินค้าเกษตร',
                hasCachedData: hasCachedData('simummuang'),
            },
            {
                id: 'talaadthai',
                name: 'ตลาดไท',
                url: 'https://www.talaadthai.com',
                description: 'ราคาสินค้าเกษตรรายวัน พร้อมแนวโน้ม',
                hasCachedData: hasCachedData('talaadthai'),
            },
        ],
        usage: {
            method: 'POST',
            queryParams: {
                source: "Optional. 'simummuang' | 'talaadthai' | 'all'. Default: 'all'",
                bypass_cache: "Optional. 'true' | 'false'. Default: 'false'",
            },
            body: {
                config: {
                    maxRetries: `Optional. Number. Default: ${SCRAPER_DEFAULT_CONFIG.maxRetries}`,
                    retryDelayMs: `Optional. Number. Default: ${SCRAPER_DEFAULT_CONFIG.retryDelayMs}`,
                    timeoutMs: `Optional. Number. Default: ${SCRAPER_DEFAULT_CONFIG.timeoutMs}`,
                },
            },
        },
        defaultConfig: SCRAPER_DEFAULT_CONFIG,
    });
}

// ============================================================================
// DELETE /api/market-prices/scrape
// ============================================================================

/**
 * DELETE /api/market-prices/scrape
 * Clear the scrape cache
 */
export async function DELETE() {
    clearScrapeCache();

    return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
    });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate price data
 */
function isValidPrice(item: ScrapedPrice): boolean {
    return (
        typeof item.priceMin === 'number' &&
        typeof item.priceMax === 'number' &&
        !isNaN(item.priceMin) &&
        !isNaN(item.priceMax) &&
        item.priceMin >= 0 &&
        item.priceMax >= 0 &&
        item.priceMin <= item.priceMax
    );
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

    // Try partial match with first word
    const firstWord = item.name.split(/[\s(]/)[0].trim();
    if (firstWord.length >= 2) {
        product = await db.product.findFirst({
            where: {
                name: { contains: firstWord, mode: 'insensitive' }
            },
        });

        if (product) return product;
    }

    // Try Thai name variants
    const nameVariants = [
        item.name.replace(/\s*\(.*?\)\s*/g, ''), // Remove parenthetical content
        item.name.split('/')[0].trim(), // Take first part if has /
        item.name.split('–')[0].trim(), // Take first part if has –
        item.name.split('-')[0].trim(), // Take first part if has -
    ].filter(v => v.length >= 2);

    for (const variant of nameVariants) {
        product = await db.product.findFirst({
            where: {
                name: { contains: variant, mode: 'insensitive' }
            },
        });
        if (product) return product;
    }

    // If no match found, return null
    // Products must exist in DB first - we don't auto-create to avoid duplicates
    return null;
}
