/**
 * Market Price Scraper Module
 * ดึงข้อมูลราคาสินค้าเกษตรจากเว็บไซต์ตลาดกลาง
 */

import * as cheerio from 'cheerio';

export interface ScrapedPrice {
    name: string;
    nameTh: string;
    category: string;
    priceMin: number;
    priceMax: number;
    unit: string;
    source: string;
    dateRecorded: Date;
    trend?: string; // 'up' | 'down' | 'stable'
    changePercent?: number;
}

export interface ScrapeResult {
    success: boolean;
    source: string;
    itemCount: number;
    data: ScrapedPrice[];
    error?: string;
    scrapedAt: Date;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * ดึงราคาจากตลาดสี่มุมเมือง
 * URL: https://www.simummuangmarket.com/en/product-list
 */
export async function scrapeSimummuangPrices(): Promise<ScrapeResult> {
    const source = 'ตลาดสี่มุมเมือง';
    const baseUrl = 'https://www.simummuangmarket.com';

    try {
        // Fetch the product list page
        const response = await fetch(`${baseUrl}/en/product-list`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const data: ScrapedPrice[] = [];

        // Parse product cards - structure based on the website
        // Each product card has name, price range, and unit
        $('a.normal-link[href^="/en/product/"]').each((_, element) => {
            try {
                const $el = $(element);
                const $card = $el.closest('.v-card') || $el.parent();

                // Get product name
                const name = $card.find('.v-card__title, .product-name').text().trim();

                // Get price text (format: "XX - YY Baht")
                const priceText = $card.find('.v-card__subtitle, .price-range').text().trim();
                const priceMatch = priceText.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);

                // Get unit (format: "Baht / กก." or "บาท / กก.")
                const unitText = $card.find('.unit, .price-unit').text().trim();
                const unit = unitText.includes('กก') ? 'กก.' :
                    unitText.includes('กำ') ? 'กำ' :
                        unitText.includes('ลูก') ? 'ลูก' : 'กก.';

                if (name && priceMatch) {
                    data.push({
                        name: name,
                        nameTh: name,
                        category: 'ผัก', // Default category, refine as needed
                        priceMin: parseFloat(priceMatch[1]),
                        priceMax: parseFloat(priceMatch[2]),
                        unit: unit,
                        source: source,
                        dateRecorded: new Date(),
                    });
                }
            } catch (err) {
                // Skip invalid entries
            }
        });

        // Alternative parsing strategy if the above doesn't work
        if (data.length === 0) {
            // Try parsing from JSON-LD or data attributes
            $('script[type="application/json"]').each((_, element) => {
                try {
                    const jsonText = $(element).html();
                    if (jsonText) {
                        const jsonData = JSON.parse(jsonText);
                        // Process if it contains product data
                        if (Array.isArray(jsonData?.products)) {
                            jsonData.products.forEach((p: any) => {
                                if (p.name && p.price) {
                                    data.push({
                                        name: p.name,
                                        nameTh: p.nameTh || p.name,
                                        category: p.category || 'ผัก',
                                        priceMin: p.priceMin || p.price,
                                        priceMax: p.priceMax || p.price,
                                        unit: p.unit || 'กก.',
                                        source: source,
                                        dateRecorded: new Date(),
                                    });
                                }
                            });
                        }
                    }
                } catch (err) {
                    // Skip invalid JSON
                }
            });
        }

        return {
            success: true,
            source,
            itemCount: data.length,
            data,
            scrapedAt: new Date(),
        };

    } catch (error) {
        return {
            success: false,
            source,
            itemCount: 0,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            scrapedAt: new Date(),
        };
    }
}

/**
 * ดึงราคาจากตลาดไท
 * URL: https://www.talaadthai.com/products?category=2
 */
export async function scrapeTalaadthaiPrices(): Promise<ScrapeResult> {
    const source = 'ตลาดไท';
    const baseUrl = 'https://www.talaadthai.com';

    try {
        // Fetch vegetables category (category=2)
        const response = await fetch(`${baseUrl}/products?category=2`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const data: ScrapedPrice[] = [];

        // Parse product cards from Talaadthai
        // Cards contain: name, price range (฿XX - YY), unit, change %
        $('.product-card, [class*="product"]').each((_, element) => {
            try {
                const $card = $(element);

                // Get product name
                const name = $card.find('.product-name, h3, h4').first().text().trim();

                // Get price (format: "฿80 - 120")
                const priceText = $card.find('.price, [class*="price"]').text().trim();
                const priceMatch = priceText.match(/฿?\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*[-–]\s*(\d+(?:,\d+)?(?:\.\d+)?)/);

                // Get unit
                const unitText = $card.find('.unit, [class*="unit"]').text().trim();
                const unit = unitText.includes('กิโลกรัม') || unitText.includes('กก') ? 'กก.' :
                    unitText.includes('กระสอบ') ? 'กระสอบ' : 'กก.';

                // Get trend/change
                const changeText = $card.find('.change, [class*="change"], [class*="trend"]').text().trim();
                const changeMatch = changeText.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
                const changePercent = changeMatch ? parseFloat(changeMatch[1]) : undefined;
                const trend = changePercent ? (changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable') : undefined;

                // Get date if available
                const dateText = $card.find('.date, [class*="date"]').text().trim();
                const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                const dateRecorded = dateMatch
                    ? new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]))
                    : new Date();

                if (name && priceMatch) {
                    data.push({
                        name: name,
                        nameTh: name,
                        category: 'ผักและสมุนไพร',
                        priceMin: parseFloat(priceMatch[1].replace(',', '')),
                        priceMax: parseFloat(priceMatch[2].replace(',', '')),
                        unit: unit,
                        source: source,
                        dateRecorded: dateRecorded,
                        trend,
                        changePercent,
                    });
                }
            } catch (err) {
                // Skip invalid entries
            }
        });

        // Try alternative parsing if no data found
        if (data.length === 0) {
            // Look for Next.js data or similar
            $('script#__NEXT_DATA__').each((_, element) => {
                try {
                    const jsonText = $(element).html();
                    if (jsonText) {
                        const nextData = JSON.parse(jsonText);
                        const products = nextData?.props?.pageProps?.products ||
                            nextData?.props?.pageProps?.data?.products || [];

                        products.forEach((p: any) => {
                            if (p.name && (p.priceMin || p.price)) {
                                data.push({
                                    name: p.name,
                                    nameTh: p.nameTh || p.name,
                                    category: p.category?.name || 'ผักและสมุนไพร',
                                    priceMin: p.priceMin || p.price,
                                    priceMax: p.priceMax || p.price,
                                    unit: p.unit || 'กก.',
                                    source: source,
                                    dateRecorded: p.date ? new Date(p.date) : new Date(),
                                    trend: p.trend,
                                    changePercent: p.changePercent,
                                });
                            }
                        });
                    }
                } catch (err) {
                    // Skip invalid JSON
                }
            });
        }

        return {
            success: true,
            source,
            itemCount: data.length,
            data,
            scrapedAt: new Date(),
        };

    } catch (error) {
        return {
            success: false,
            source,
            itemCount: 0,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            scrapedAt: new Date(),
        };
    }
}

/**
 * ดึงราคาจากทุกแหล่ง
 */
export async function scrapeAllMarketPrices(): Promise<ScrapeResult[]> {
    const results = await Promise.all([
        scrapeSimummuangPrices(),
        scrapeTalaadthaiPrices(),
    ]);
    return results;
}

/**
 * Map product name to category
 */
export function categorizeProduct(name: string): string {
    const nameLower = name.toLowerCase();

    // ผักปรุงรส
    if (/พริก|กระเทียม|หอมแดง|ขิง|ข่า|ตะไคร้|มะกรูด|มะนาว/.test(name)) {
        return 'ผักปรุงรส';
    }
    // ผักใบ
    if (/ผักชี|หอม|ขึ้นฉ่าย|กะหล่ำ|ผักกาด|คะน้า|ผักบุ้ง|กวางตุ้ง|โหระพา|กะเพรา|แมงลัก|สลัด/.test(name)) {
        return 'ผักใบ';
    }
    // ผักผล
    if (/แตง|ถั่ว|มะเขือ|ฟัก|มะระ|บวบ|ข้าวโพด/.test(name)) {
        return 'ผักผล';
    }
    // ผักหัว
    if (/แครอท|หัวไชเท้า|มันฝรั่ง|หอมหัวใหญ่/.test(name)) {
        return 'ผักหัว';
    }
    // เห็ด
    if (/เห็ด/.test(name)) {
        return 'เห็ด';
    }
    // ผลไม้
    if (/มะม่วง|ส้ม|กล้วย|แตงโม|สับปะรด|มะละกอ|ทุเรียน|มังคุด|ลำไย|ลิ้นจี่/.test(name)) {
        return 'ผลไม้';
    }

    return 'อื่นๆ';
}

/**
 * Map trend text to level
 */
export function mapTrendToLevel(trend?: string, changePercent?: number): 'สูง' | 'ปานกลาง' | 'ปกติ' | 'ต่ำ' | 'ทรงตัว' {
    if (!trend && changePercent === undefined) return 'ปกติ';

    if (trend === 'up' || (changePercent && changePercent >= 10)) return 'สูง';
    if (trend === 'up' || (changePercent && changePercent >= 5)) return 'ปานกลาง';
    if (trend === 'down' || (changePercent && changePercent <= -5)) return 'ต่ำ';
    if (changePercent !== undefined && Math.abs(changePercent) < 3) return 'ทรงตัว';

    return 'ปกติ';
}
