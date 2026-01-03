/**
 * Market Price Scraper Module
 * ดึงข้อมูลราคาสินค้าเกษตรจากเว็บไซต์ตลาดกลาง
 * 
 * Features:
 * - Retry logic with exponential backoff
 * - In-memory caching with TTL
 * - Rate limiting between requests
 * - Structured error handling
 * - Multiple parsing strategies
 */

import * as cheerio from 'cheerio';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ScrapedPrice {
    name: string;
    nameTh: string;
    category: string;
    priceMin: number;
    priceMax: number;
    unit: string;
    source: string;
    dateRecorded: Date;
    trend?: 'up' | 'down' | 'stable';
    changePercent?: number;
}

export interface ScrapeResult {
    success: boolean;
    source: string;
    itemCount: number;
    data: ScrapedPrice[];
    error?: string;
    errorCode?: ScraperErrorCode;
    scrapedAt: Date;
    cached?: boolean;
    durationMs?: number;
}

export type ScraperErrorCode =
    | 'NETWORK_ERROR'
    | 'TIMEOUT'
    | 'PARSE_ERROR'
    | 'RATE_LIMITED'
    | 'NOT_FOUND'
    | 'SERVER_ERROR'
    | 'UNKNOWN';

export interface ScraperConfig {
    maxRetries: number;
    retryDelayMs: number;
    timeoutMs: number;
    cacheTtlMs: number;
    rateLimitDelayMs: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: ScraperConfig = {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    cacheTtlMs: 60 * 60 * 1000, // 1 hour
    rateLimitDelayMs: 1000,
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class SimpleCache<T> {
    private cache = new Map<string, CacheEntry<T>>();

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(key: string, data: T, ttlMs: number): void {
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttlMs,
        });
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }
}

const scrapeCache = new SimpleCache<ScrapeResult>();

// ============================================================================
// Rate Limiter
// ============================================================================

let lastRequestTime = 0;

async function rateLimit(delayMs: number = DEFAULT_CONFIG.rateLimitDelayMs): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;

    if (elapsed < delayMs) {
        await sleep(delayMs - elapsed);
    }

    lastRequestTime = Date.now();
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    config: ScraperConfig = DEFAULT_CONFIG
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
        try {
            // Rate limit between attempts
            await rateLimit(config.rateLimitDelayMs);

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    return response;
                }

                // Handle specific HTTP errors
                if (response.status === 429) {
                    console.warn(`⚠️ Rate limited by ${url}, waiting longer...`);
                    await sleep(config.retryDelayMs * Math.pow(2, attempt + 2));
                    continue;
                }

                if (response.status >= 500) {
                    console.warn(`⚠️ Server error ${response.status} from ${url}, retrying...`);
                    await sleep(config.retryDelayMs * Math.pow(2, attempt));
                    continue;
                }

                // Client errors (4xx except 429) - don't retry
                throw new ScraperError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR'
                );

            } finally {
                clearTimeout(timeoutId);
            }

        } catch (error) {
            lastError = error as Error;

            if (error instanceof ScraperError) {
                throw error; // Don't retry client errors
            }

            if ((error as Error).name === 'AbortError') {
                console.warn(`⏱️ Timeout on attempt ${attempt + 1} for ${url}`);
            } else {
                console.warn(`🔄 Retry ${attempt + 1}/${config.maxRetries} for ${url}: ${(error as Error).message}`);
            }

            if (attempt < config.maxRetries - 1) {
                await sleep(config.retryDelayMs * Math.pow(2, attempt));
            }
        }
    }

    throw new ScraperError(
        `Failed after ${config.maxRetries} retries: ${lastError?.message}`,
        'NETWORK_ERROR'
    );
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class ScraperError extends Error {
    constructor(
        message: string,
        public code: ScraperErrorCode
    ) {
        super(message);
        this.name = 'ScraperError';
    }
}

// ============================================================================
// Logging Utilities
// ============================================================================

function logScrapeStart(source: string): void {
    console.log(`🔍 [${new Date().toISOString()}] Starting scrape: ${source}`);
}

function logScrapeSuccess(source: string, itemCount: number, durationMs: number, cached: boolean): void {
    const cacheTag = cached ? ' (cached)' : '';
    console.log(`✅ [${new Date().toISOString()}] ${source}: ${itemCount} items in ${durationMs}ms${cacheTag}`);
}

function logScrapeError(source: string, error: Error): void {
    console.error(`❌ [${new Date().toISOString()}] ${source} error: ${error.message}`);
}

// ============================================================================
// Simummuang Market Scraper
// ============================================================================

/**
 * ดึงราคาจากตลาดสี่มุมเมือง
 * URL: https://www.simummuangmarket.com/en/product-list
 */
export async function scrapeSimummuangPrices(
    config: Partial<ScraperConfig> = {},
    bypassCache: boolean = false
): Promise<ScrapeResult> {
    const source = 'ตลาดสี่มุมเมือง';
    const baseUrl = 'https://www.simummuangmarket.com';
    const cacheKey = `simummuang_prices`;
    const startTime = Date.now();
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    logScrapeStart(source);

    // Check cache first
    if (!bypassCache) {
        const cached = scrapeCache.get(cacheKey);
        if (cached) {
            const durationMs = Date.now() - startTime;
            logScrapeSuccess(source, cached.itemCount, durationMs, true);
            return { ...cached, cached: true, durationMs };
        }
    }

    try {
        const response = await fetchWithRetry(
            `${baseUrl}/en/product-list`,
            {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                },
            },
            mergedConfig
        );

        const html = await response.text();
        const $ = cheerio.load(html);
        const data: ScrapedPrice[] = [];

        // Strategy 1: Parse product cards from product listing
        $('a.normal-link[href^="/en/product/"], a[href^="/en/product/"]').each((_, element) => {
            try {
                const $el = $(element);
                const $card = $el.closest('.v-card, [class*="card"], .product-item') || $el.parent();

                // Get product name from various possible locations
                const name = $card.find('.v-card__title, .product-name, h3, h4, .title').first().text().trim() ||
                    $el.text().trim();

                // Get price text (format: "XX - YY Baht" or "XX-YY")
                const priceText = $card.find('.v-card__subtitle, .price-range, .price, [class*="price"]').text().trim();
                const priceMatch = priceText.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*[-–]\s*(\d+(?:,\d+)?(?:\.\d+)?)/);

                // Get unit
                const unitText = $card.find('.unit, .price-unit, [class*="unit"]').text().trim();
                const unit = parseUnit(unitText);

                if (name && priceMatch) {
                    data.push({
                        name: name,
                        nameTh: name,
                        category: categorizeProduct(name),
                        priceMin: parseFloat(priceMatch[1].replace(',', '')),
                        priceMax: parseFloat(priceMatch[2].replace(',', '')),
                        unit: unit,
                        source: source,
                        dateRecorded: new Date(),
                    });
                }
            } catch {
                // Skip invalid entries silently
            }
        });

        // Strategy 2: Try parsing from embedded JSON data
        if (data.length === 0) {
            $('script[type="application/json"], script[type="application/ld+json"]').each((_, element) => {
                try {
                    const jsonText = $(element).html();
                    if (jsonText) {
                        const jsonData = JSON.parse(jsonText);
                        extractProductsFromJson(jsonData, source, data);
                    }
                } catch {
                    // Skip invalid JSON
                }
            });
        }

        // Strategy 3: Look for Next.js hydration data
        if (data.length === 0) {
            $('script#__NEXT_DATA__').each((_, element) => {
                try {
                    const jsonText = $(element).html();
                    if (jsonText) {
                        const nextData = JSON.parse(jsonText);
                        const products = nextData?.props?.pageProps?.products ||
                            nextData?.props?.pageProps?.data?.products || [];

                        for (const p of products) {
                            if (p.name && (p.priceMin || p.price)) {
                                data.push({
                                    name: p.name,
                                    nameTh: p.nameTh || p.name,
                                    category: p.category?.name || categorizeProduct(p.name),
                                    priceMin: p.priceMin || p.price,
                                    priceMax: p.priceMax || p.price,
                                    unit: p.unit || 'กก.',
                                    source: source,
                                    dateRecorded: p.date ? new Date(p.date) : new Date(),
                                    trend: p.trend as 'up' | 'down' | 'stable' | undefined,
                                    changePercent: p.changePercent,
                                });
                            }
                        }
                    }
                } catch {
                    // Skip invalid JSON
                }
            });
        }

        const result: ScrapeResult = {
            success: true,
            source,
            itemCount: data.length,
            data,
            scrapedAt: new Date(),
            durationMs: Date.now() - startTime,
        };

        // Cache the result
        scrapeCache.set(cacheKey, result, mergedConfig.cacheTtlMs);

        logScrapeSuccess(source, data.length, result.durationMs!, false);
        return result;

    } catch (error) {
        const durationMs = Date.now() - startTime;
        logScrapeError(source, error as Error);

        return {
            success: false,
            source,
            itemCount: 0,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: error instanceof ScraperError ? error.code : 'UNKNOWN',
            scrapedAt: new Date(),
            durationMs,
        };
    }
}

// ============================================================================
// Talaadthai Market Scraper
// ============================================================================

/**
 * ดึงราคาจากตลาดไท
 * URL: https://www.talaadthai.com/products?category=2
 */
export async function scrapeTalaadthaiPrices(
    config: Partial<ScraperConfig> = {},
    bypassCache: boolean = false
): Promise<ScrapeResult> {
    const source = 'ตลาดไท';
    const baseUrl = 'https://www.talaadthai.com';
    const cacheKey = `talaadthai_prices`;
    const startTime = Date.now();
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    logScrapeStart(source);

    // Check cache first
    if (!bypassCache) {
        const cached = scrapeCache.get(cacheKey);
        if (cached) {
            const durationMs = Date.now() - startTime;
            logScrapeSuccess(source, cached.itemCount, durationMs, true);
            return { ...cached, cached: true, durationMs };
        }
    }

    try {
        // Fetch vegetables category (category=2)
        const response = await fetchWithRetry(
            `${baseUrl}/products?category=2`,
            {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                },
            },
            mergedConfig
        );

        const html = await response.text();
        const $ = cheerio.load(html);
        const data: ScrapedPrice[] = [];

        // Strategy 1: Parse product cards
        $('.product-card, [class*="product"], a[href*="/products/"]').each((_, element) => {
            try {
                const $el = $(element);
                const $card = $el.is('a') ? $el : $el.closest('a, .card, [class*="card"]');

                // Get product name
                const name = $card.find('.product-name, h3, h4, .title').first().text().trim() ||
                    $card.text().split(/[฿\d]/)[0].trim();

                // Get price (format: "฿80 - 120" or "80-120")
                const priceText = $card.find('.price, [class*="price"]').text().trim() ||
                    $card.text();
                const priceMatch = priceText.match(/฿?\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*[-–]\s*(\d+(?:,\d+)?(?:\.\d+)?)/);

                // Get unit
                const unitText = $card.find('.unit, [class*="unit"]').text().trim();
                const unit = parseUnit(unitText);

                // Get trend/change
                const changeText = $card.find('.change, [class*="change"], [class*="trend"]').text().trim();
                const changeMatch = changeText.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
                const changePercent = changeMatch ? parseFloat(changeMatch[1]) : undefined;
                const trend = changePercent !== undefined
                    ? (changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable')
                    : undefined;

                // Get date if available
                const dateText = $card.find('.date, [class*="date"]').text().trim();
                const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                const dateRecorded = dateMatch
                    ? new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]))
                    : new Date();

                if (name && name.length > 1 && priceMatch) {
                    data.push({
                        name: cleanProductName(name),
                        nameTh: cleanProductName(name),
                        category: categorizeProduct(name),
                        priceMin: parseFloat(priceMatch[1].replace(',', '')),
                        priceMax: parseFloat(priceMatch[2].replace(',', '')),
                        unit: unit,
                        source: source,
                        dateRecorded: dateRecorded,
                        trend: trend as 'up' | 'down' | 'stable' | undefined,
                        changePercent,
                    });
                }
            } catch {
                // Skip invalid entries
            }
        });

        // Strategy 2: Parse from Next.js data
        if (data.length === 0) {
            $('script#__NEXT_DATA__').each((_, element) => {
                try {
                    const jsonText = $(element).html();
                    if (jsonText) {
                        const nextData = JSON.parse(jsonText);
                        const products = nextData?.props?.pageProps?.products ||
                            nextData?.props?.pageProps?.data?.products ||
                            nextData?.props?.pageProps?.initialData?.products || [];

                        for (const p of products) {
                            if (p.name && (p.priceMin || p.price)) {
                                data.push({
                                    name: p.name,
                                    nameTh: p.nameTh || p.name,
                                    category: p.category?.name || categorizeProduct(p.name),
                                    priceMin: p.priceMin || p.price,
                                    priceMax: p.priceMax || p.price,
                                    unit: p.unit || 'กก.',
                                    source: source,
                                    dateRecorded: p.date ? new Date(p.date) : new Date(),
                                    trend: p.trend as 'up' | 'down' | 'stable' | undefined,
                                    changePercent: p.changePercent,
                                });
                            }
                        }
                    }
                } catch {
                    // Skip invalid JSON
                }
            });
        }

        // Strategy 3: Extract from link hrefs (fallback for JS-rendered pages)
        if (data.length === 0) {
            $('a[href*="/products/"]').each((_, element) => {
                try {
                    const $el = $(element);
                    const href = $el.attr('href') || '';
                    const text = $el.text().trim();

                    // Extract product name from href or text
                    const hrefMatch = href.match(/\/products\/([^/]+)/);
                    if (hrefMatch && text && text.length > 2) {
                        // Create placeholder data (actual price needs API call)
                        const name = cleanProductName(text);
                        if (name && !name.includes('ดู') && !name.includes('รายการ')) {
                            // Note: This is limited data since we can't get prices from links alone
                            // The data structure is created but priceMin/priceMax will need updating
                        }
                    }
                } catch {
                    // Skip
                }
            });
        }

        const result: ScrapeResult = {
            success: true,
            source,
            itemCount: data.length,
            data,
            scrapedAt: new Date(),
            durationMs: Date.now() - startTime,
        };

        // Cache the result
        scrapeCache.set(cacheKey, result, mergedConfig.cacheTtlMs);

        logScrapeSuccess(source, data.length, result.durationMs!, false);
        return result;

    } catch (error) {
        const durationMs = Date.now() - startTime;
        logScrapeError(source, error as Error);

        return {
            success: false,
            source,
            itemCount: 0,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: error instanceof ScraperError ? error.code : 'UNKNOWN',
            scrapedAt: new Date(),
            durationMs,
        };
    }
}

// ============================================================================
// Combined Scraper
// ============================================================================

/**
 * ดึงราคาจากทุกแหล่ง
 */
export async function scrapeAllMarketPrices(
    config: Partial<ScraperConfig> = {},
    bypassCache: boolean = false
): Promise<ScrapeResult[]> {
    console.log('🚀 Starting scrape from all sources...');
    const startTime = Date.now();

    const results = await Promise.all([
        scrapeSimummuangPrices(config, bypassCache),
        scrapeTalaadthaiPrices(config, bypassCache),
    ]);

    const totalItems = results.reduce((sum, r) => sum + r.itemCount, 0);
    const successCount = results.filter(r => r.success).length;

    console.log(`📊 All sources completed: ${successCount}/${results.length} successful, ${totalItems} total items in ${Date.now() - startTime}ms`);

    return results;
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Clear the scrape cache
 */
export function clearScrapeCache(): void {
    scrapeCache.clear();
    console.log('🧹 Scrape cache cleared');
}

/**
 * Check if cache exists for a source
 */
export function hasCachedData(source: 'simummuang' | 'talaadthai'): boolean {
    const cacheKey = `${source}_prices`;
    return scrapeCache.has(cacheKey);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse unit from text
 */
function parseUnit(unitText: string): string {
    if (!unitText) return 'กก.';

    const text = unitText.toLowerCase();
    if (text.includes('กิโลกรัม') || text.includes('กก')) return 'กก.';
    if (text.includes('กระสอบ')) return 'กระสอบ';
    if (text.includes('กำ')) return 'กำ';
    if (text.includes('ลูก')) return 'ลูก';
    if (text.includes('หัว')) return 'หัว';
    if (text.includes('ถุง')) return 'ถุง';
    if (text.includes('กล่อง')) return 'กล่อง';

    return 'กก.';
}

/**
 * Clean product name
 */
function cleanProductName(name: string): string {
    return name
        .replace(/\s+/g, ' ')
        .replace(/\n/g, ' ')
        .trim();
}

/**
 * Extract products from JSON data
 */
function extractProductsFromJson(
    jsonData: unknown,
    source: string,
    data: ScrapedPrice[]
): void {
    if (!jsonData || typeof jsonData !== 'object') return;

    const obj = jsonData as Record<string, unknown>;

    // Try various product array paths
    const productArrays = [
        obj.products,
        obj.data,
        obj.items,
        (obj.props as Record<string, unknown>)?.pageProps,
    ];

    for (const arr of productArrays) {
        if (Array.isArray(arr)) {
            for (const p of arr as Record<string, unknown>[]) {
                if (p.name && (p.priceMin || p.price)) {
                    data.push({
                        name: String(p.name),
                        nameTh: String(p.nameTh || p.name),
                        category: String(p.category || 'ผัก'),
                        priceMin: Number(p.priceMin || p.price),
                        priceMax: Number(p.priceMax || p.price),
                        unit: String(p.unit || 'กก.'),
                        source: source,
                        dateRecorded: new Date(),
                    });
                }
            }
        }
    }
}

/**
 * Map product name to category
 */
export function categorizeProduct(name: string): string {
    if (!name) return 'อื่นๆ';

    // ผักปรุงรส
    if (/พริก|กระเทียม|หอมแดง|ขิง|ข่า|ตะไคร้|มะกรูด|มะนาว|กระชาย/.test(name)) {
        return 'ผักปรุงรส';
    }
    // ผักใบ
    if (/ผักชี|หอม(?!แดง)|ขึ้นฉ่าย|คึ่นช่าย|กะหล่ำ|ผักกาด|คะน้า|ผักบุ้ง|กวางตุ้ง|โหระพา|กะเพรา|แมงลัก|สลัด|กรีนโอ๊ค|ชะอม|สะระแหน่/.test(name)) {
        return 'ผักใบ';
    }
    // ผักผล
    if (/แตง(?!โม)|ถั่ว|มะเขือ|ฟัก|มะระ|บวบ|ข้าวโพด|กระเจี๊ยบ/.test(name)) {
        return 'ผักผล';
    }
    // ผักหัว
    if (/แครอท|หัวไชเท้า|มันฝรั่ง|หอมหัวใหญ่|เผือก|หน่อไม้/.test(name)) {
        return 'ผักหัว';
    }
    // เห็ด
    if (/เห็ด/.test(name)) {
        return 'เห็ด';
    }
    // ผลไม้
    if (/มะม่วง|ส้ม|กล้วย|แตงโม|สับปะรด|มะละกอ|ทุเรียน|มังคุด|ลำไย|ลิ้นจี่|เงาะ|ฝรั่ง|ชมพู่|มะพร้าว/.test(name)) {
        return 'ผลไม้';
    }
    // ดอกไม้
    if (/ดอก|มะลิ|ดาวเรือง/.test(name)) {
        return 'ดอกไม้';
    }
    // เนื้อสัตว์
    if (/หมู|ไก่|เนื้อ|ปลา|กุ้ง|กบ|หมึก/.test(name)) {
        return 'เนื้อสัตว์';
    }

    return 'อื่นๆ';
}

/**
 * Map trend text to level
 */
export function mapTrendToLevel(trend?: string, changePercent?: number): 'สูง' | 'ปานกลาง' | 'ปกติ' | 'ต่ำ' | 'ทรงตัว' {
    if (!trend && changePercent === undefined) return 'ปกติ';

    if (trend === 'up' || (changePercent !== undefined && changePercent >= 10)) return 'สูง';
    if (trend === 'up' || (changePercent !== undefined && changePercent >= 5)) return 'ปานกลาง';
    if (trend === 'down' || (changePercent !== undefined && changePercent <= -5)) return 'ต่ำ';
    if (changePercent !== undefined && Math.abs(changePercent) < 3) return 'ทรงตัว';

    return 'ปกติ';
}

// ============================================================================
// Export Configuration
// ============================================================================

export { DEFAULT_CONFIG as SCRAPER_DEFAULT_CONFIG };
