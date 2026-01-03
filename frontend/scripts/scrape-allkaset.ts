/**
 * Scraper for historical vegetable/fruit prices from allkaset.com
 * 
 * Usage:
 *   npx tsx scripts/scrape-allkaset.ts [--dry-run] [--limit=N]
 * 
 * Options:
 *   --dry-run   Parse and display data without inserting to database
 *   --limit=N   Limit number of products to scrape (for testing)
 */

import 'dotenv/config';
import { parse } from 'node-html-parser';
import { PrismaClient, ProductCategory } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma client setup
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Product mapping: allkaset pk → product info
// These are common vegetables/fruits from the allkaset price page
const ALLKASET_PRODUCTS: Record<number, { name: string; category: ProductCategory }> = {
    // ผักปรุงรส (Seasoning/Herbs)
    4206: { name: 'พริกขี้หนูสวน', category: ProductCategory.CROP },
    4262: { name: 'พริกขี้หนู', category: ProductCategory.CROP },
    4236: { name: 'พริกจินดาแดง', category: ProductCategory.CROP },
    4282: { name: 'พริกกะเหรี่ยง', category: ProductCategory.CROP },
    4229: { name: 'พริกเหลือง', category: ProductCategory.CROP },
    4249: { name: 'พริกหยวก', category: ProductCategory.CROP },
    4273: { name: 'พริกหวาน', category: ProductCategory.CROP },
    4261: { name: 'หอมแดง', category: ProductCategory.CROP },
    4238: { name: 'ต้นหอม', category: ProductCategory.CROP },
    4208: { name: 'คื่นช่าย', category: ProductCategory.CROP },
    4225: { name: 'ผักชี', category: ProductCategory.CROP },
    4209: { name: 'ผักชีลาว', category: ProductCategory.CROP },
    4269: { name: 'ผักชีฝรั่ง', category: ProductCategory.CROP },
    4210: { name: 'สาระแหน่', category: ProductCategory.CROP },
    4207: { name: 'โหระพา', category: ProductCategory.CROP },
    4259: { name: 'กะเพรา', category: ProductCategory.CROP },
    4231: { name: 'แมงลัก', category: ProductCategory.CROP },
    4278: { name: 'กุยช่าย', category: ProductCategory.CROP },

    // ผักใบ (Leafy vegetables)
    4254: { name: 'คะน้าฮ่องกง', category: ProductCategory.CROP },
    4271: { name: 'คะน้ายอด', category: ProductCategory.CROP },
    4232: { name: 'คะน้าต้น', category: ProductCategory.CROP },
    4275: { name: 'กวางตุ้งดอก', category: ProductCategory.CROP },
    4276: { name: 'กวางตุ้งใบ', category: ProductCategory.CROP },
    4277: { name: 'ผักบุ้งจีน', category: ProductCategory.CROP },
    4266: { name: 'ผักบุ้งไทย', category: ProductCategory.CROP },
    4268: { name: 'ผักกาดหอม', category: ProductCategory.CROP },
    4264: { name: 'ผักกาดเขียว', category: ProductCategory.CROP },
    4255: { name: 'ปวยเล้ง', category: ProductCategory.CROP },
    4274: { name: 'ผักโขม', category: ProductCategory.CROP },
    4256: { name: 'กรีนโอ๊ค', category: ProductCategory.CROP },
    4239: { name: 'กรีนคอส', category: ProductCategory.CROP },
    4205: { name: 'บัตเตอร์เฮด', category: ProductCategory.CROP },
    4265: { name: 'กะหล่ำปลี', category: ProductCategory.CROP },
    4257: { name: 'กะหล่ำปลีม่วง', category: ProductCategory.CROP },
    4243: { name: 'กะหล่ำปลีหัวใจ', category: ProductCategory.CROP },
    4226: { name: 'กะหล่ำดอก', category: ProductCategory.CROP },

    // ผักผล (Fruit vegetables)
    4250: { name: 'แตงกวา', category: ProductCategory.CROP },
    4211: { name: 'แตงร้าน', category: ProductCategory.CROP },
    4220: { name: 'เมล่อน', category: ProductCategory.CROP },
    4252: { name: 'แคนตาลูป', category: ProductCategory.CROP },
    4234: { name: 'แตงโมซอนญ่า', category: ProductCategory.CROP },
    4228: { name: 'แตงโมกินนรี', category: ProductCategory.CROP },
    4251: { name: 'แตงโมตอปิโด', category: ProductCategory.CROP },
    4258: { name: 'แตงโมจินตหรา', category: ProductCategory.CROP },
    4279: { name: 'แตงโมอ่อน', category: ProductCategory.CROP },
    4218: { name: 'แตงไทย', category: ProductCategory.CROP },
    4260: { name: 'มะเขือเทศสีดา', category: ProductCategory.CROP },
    4245: { name: 'มะเขือเทศลูกท้อ', category: ProductCategory.CROP },
    4235: { name: 'มะเขือเทศราชินี', category: ProductCategory.CROP },
    4253: { name: 'มะเขือเปราะ', category: ProductCategory.CROP },
    4204: { name: 'มะเขือยาว', category: ProductCategory.CROP },
    4216: { name: 'มะเขือม่วง', category: ProductCategory.CROP },
    4212: { name: 'มะเขือไข่เต่า', category: ProductCategory.CROP },
    4241: { name: 'มะเขือลิง', category: ProductCategory.CROP },
    4233: { name: 'มะเขือพวง', category: ProductCategory.CROP },
    4240: { name: 'มะระจีน', category: ProductCategory.CROP },
    4267: { name: 'มะระขี้นก', category: ProductCategory.CROP },
    4221: { name: 'บวบเหลี่ยม', category: ProductCategory.CROP },
    4247: { name: 'บวบหอม', category: ProductCategory.CROP },
    4248: { name: 'บวบงู', category: ProductCategory.CROP },
    4222: { name: 'ฟักทองญี่ปุ่น', category: ProductCategory.CROP },
    4272: { name: 'ฟักทองคางคก', category: ProductCategory.CROP },
    4219: { name: 'ฟักทองทองอำไพ', category: ProductCategory.CROP },
    4244: { name: 'ถั่วฝักยาว', category: ProductCategory.CROP },
    4270: { name: 'ถั่วพู', category: ProductCategory.CROP },
    4213: { name: 'ถั่วแขก', category: ProductCategory.CROP },
    4246: { name: 'ถั่วลันเตา', category: ProductCategory.CROP },
    4237: { name: 'ข้าวโพดฝักอ่อน', category: ProductCategory.CROP },
    4283: { name: 'ข้าวโพดข้าวเหนียว', category: ProductCategory.CROP },
    4214: { name: 'กระเจี๊ยบเขียว', category: ProductCategory.CROP },
    4217: { name: 'แครอท', category: ProductCategory.CROP },

    // ผลไม้ (Fruits)
    4203: { name: 'ผักชี', category: ProductCategory.CROP }, // Duplicate, skip
    4224: { name: 'ดาวเรือง', category: ProductCategory.CROP },
    4230: { name: 'ดอกแค', category: ProductCategory.CROP },
    4263: { name: 'สตรอว์เบอร์รี่', category: ProductCategory.CROP },
    4223: { name: 'มะละกอ', category: ProductCategory.CROP },
    4215: { name: 'มะละกอฮอลแลนด์', category: ProductCategory.CROP },
    4280: { name: 'มะละกอแขกดำ', category: ProductCategory.CROP },
    4227: { name: 'มะรุม', category: ProductCategory.CROP },
    4281: { name: 'น้ำเต้า', category: ProductCategory.CROP },
};

// Market sources
const MARKET_SOURCES = {
    'ตลาดไท': 'ตลาดไท',
    'ตลาดสี่มุมเมือง': 'ตลาดสี่มุมเมือง',
    'ตลาดศรีเมือง': 'ตลาดศรีเมือง',
} as const;

interface PriceRecord {
    productName: string;
    sourceName: string;
    price: number;
    dateRecorded: Date;
}

/**
 * Parse Thai date string to JavaScript Date
 * Input format: "9/6/2568" (D/M/YYYY Buddhist Era) or "9/6/2025" (Gregorian)
 */
function parseThaiDate(dateStr: string): Date {
    const parts = dateStr.trim().split('/');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${dateStr}`);
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    let year = parseInt(parts[2], 10);

    // Convert Buddhist Era to Gregorian (BE = CE + 543)
    if (year > 2500) {
        year -= 543;
    }

    return new Date(year, month, day);
}

/**
 * Parse price string to number
 * Input format: "560.00 บาท" or "560.00"
 */
function parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^\d.]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
}

/**
 * Fetch and parse historical price data for a single product
 */
async function scrapeProduct(pk: number): Promise<PriceRecord[]> {
    const productInfo = ALLKASET_PRODUCTS[pk];
    if (!productInfo) {
        console.warn(`Unknown product pk: ${pk}`);
        return [];
    }

    const url = `https://www.allkaset.com/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A2%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87.php?pk=${pk}`;

    console.log(`  Fetching ${productInfo.name} (pk=${pk})...`);

    const response = await fetch(url);
    if (!response.ok) {
        console.error(`  Failed to fetch pk=${pk}: ${response.status}`);
        return [];
    }

    const html = await response.text();
    const root = parse(html);

    const records: PriceRecord[] = [];

    // Find all tables with price data
    const tables = root.querySelectorAll('table');

    for (const table of tables) {
        const rows = table.querySelectorAll('tr');

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) continue;

            // Expected format: Date | Talaad Thai | Simummuang | Srimeung | Average
            const dateText = cells[0].text.trim();

            // Skip header rows
            if (dateText === 'วันที่' || !dateText.match(/\d+\/\d+\/\d+/)) {
                continue;
            }

            try {
                const date = parseThaiDate(dateText);

                // Parse each market price
                const marketPrices: [string, string][] = [
                    ['ตลาดไท', cells[1].text],
                    ['ตลาดสี่มุมเมือง', cells[2].text],
                    ['ตลาดศรีเมือง', cells[3].text],
                ];

                for (const [market, priceText] of marketPrices) {
                    const price = parsePrice(priceText);
                    if (price > 0) {
                        records.push({
                            productName: productInfo.name,
                            sourceName: market,
                            price,
                            dateRecorded: date,
                        });
                    }
                }
            } catch (err) {
                // Skip invalid rows
            }
        }
    }

    console.log(`    Found ${records.length} price records`);
    return records;
}

/**
 * Ensure products exist in database, create if missing
 * Returns a map of product name → product id
 */
async function ensureProducts(): Promise<Map<string, number>> {
    console.log('📦 Ensuring products exist in database...');

    const productNameToId = new Map<string, number>();

    // Get existing products
    const existingProducts = await prisma.product.findMany({
        select: { id: true, name: true },
    });

    for (const p of existingProducts) {
        productNameToId.set(p.name, p.id);
    }

    // Create missing products
    const allProductNames = new Set(Object.values(ALLKASET_PRODUCTS).map(p => p.name));

    for (const info of Object.values(ALLKASET_PRODUCTS)) {
        if (!productNameToId.has(info.name)) {
            console.log(`  Creating product: ${info.name}`);
            const product = await prisma.product.create({
                data: {
                    name: info.name,
                    category: info.category,
                    growthDurationDays: 60, // Default
                    imageUrl: `/crops/vegetable.png`, // Default image
                },
            });
            productNameToId.set(info.name, product.id);
        }
    }

    console.log(`  Total products: ${productNameToId.size}`);
    return productNameToId;
}

/**
 * Insert price records to database
 */
async function insertPrices(
    records: PriceRecord[],
    productNameToId: Map<string, number>,
    dryRun: boolean
): Promise<number> {
    if (records.length === 0) return 0;

    // Group records by product for efficient insertion
    const priceData = records
        .filter(r => productNameToId.has(r.productName))
        .map(r => ({
            productId: productNameToId.get(r.productName)!,
            sourceName: r.sourceName,
            priceMin: r.price,
            priceMax: r.price,
            dateRecorded: r.dateRecorded,
        }));

    if (dryRun) {
        console.log(`  [DRY RUN] Would insert ${priceData.length} records`);
        // Show sample records
        console.log('  Sample records:');
        priceData.slice(0, 5).forEach((r, i) => {
            console.log(`    ${i + 1}. Product ${r.productId}, ${r.sourceName}, ${r.priceMin} บาท, ${r.dateRecorded.toISOString().split('T')[0]}`);
        });
        return priceData.length;
    }

    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < priceData.length; i += BATCH_SIZE) {
        const batch = priceData.slice(i, i + BATCH_SIZE);
        await prisma.marketPrice.createMany({
            data: batch,
            skipDuplicates: true,
        });
        inserted += batch.length;
        console.log(`    Inserted ${inserted}/${priceData.length} records`);
    }

    return inserted;
}

/**
 * Main scraper function
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

    console.log('🌾 Allkaset Price Scraper');
    console.log('========================');
    if (dryRun) console.log('🔍 DRY RUN MODE - No database changes');
    if (limit) console.log(`📊 Limited to ${limit} products`);
    console.log('');

    // Ensure products exist
    const productNameToId = await ensureProducts();

    // Scrape all products
    console.log('');
    console.log('📥 Scraping historical prices...');

    const productKeys = Object.keys(ALLKASET_PRODUCTS).map(Number);
    const keysToProcess = limit ? productKeys.slice(0, limit) : productKeys;

    const allRecords: PriceRecord[] = [];
    let processedCount = 0;

    for (const pk of keysToProcess) {
        const records = await scrapeProduct(pk);
        allRecords.push(...records);
        processedCount++;

        // Rate limiting - wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('');
    console.log(`📊 Total records scraped: ${allRecords.length}`);

    // Insert to database
    console.log('');
    console.log('💾 Saving to database...');
    const insertedCount = await insertPrices(allRecords, productNameToId, dryRun);

    console.log('');
    console.log('✅ Scraping completed!');
    console.log(`   Products processed: ${processedCount}`);
    console.log(`   Records ${dryRun ? 'found' : 'inserted'}: ${insertedCount}`);
}

main()
    .catch((err) => {
        console.error('❌ Scraping failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
