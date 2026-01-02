import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as cheerio from 'cheerio';  // ต้อง npm install cheerio ก่อนใช้งาน

export async function GET() {
    try {
        // Get the latest price for each product
        const prices = await db.marketPrice.findMany({
            include: {
                product: true,
            },
            orderBy: {
                dateRecorded: 'desc',
            },
        });

        // Transform to the expected format
        const formattedPrices = prices.map((price) => ({
            id: Number(price.id),
            name: price.product.name,
            category: price.product.category,
            priceMin: Number(price.priceMin),
            priceMax: Number(price.priceMax),
            unit: determinePriceUnit(price.product.name),
            source: price.sourceName,
            lastUpdated: price.dateRecorded.toISOString(),
        }));

        return NextResponse.json(formattedPrices);
    } catch (error) {
        console.error('Error fetching market prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market prices' },
            { status: 500 }
        );
    }
}

function determinePriceUnit(productName: string): string {
    // Common Thai agricultural price units
    if (productName.includes('ข้าว') || productName.includes('อ้อย')) {
        return 'บาท/ตัน';
    }
    return 'บาท/กก.';
}

// ใช้สำหรับกดปุ่ม "ดึงข้อมูลทันที" ในหน้า Admin
export async function POST(req: Request) {
    try {
        console.log('🔄 Starting Market Price Sync...');

        // -----------------------------------------------------------------------
        // ตัวอย่าง: ดึงข้อมูลจากเว็บตลาดกลาง (สมมติ URL)
        // -----------------------------------------------------------------------
        const targetUrl = 'https://www.example-market.com/daily-price/vegetables';

        // 1. Fetch HTML หน้าเว็บมา
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch source: ${response.statusText}`);
        }

        const html = await response.text();

        // 2. ใช้ Cheerio แปลง HTML ให้ Select ได้เหมือน jQuery
        const $ = cheerio.load(html);
        const scrapedData: any[] = [];

        // 3. วนลูปแกะข้อมูลจากตาราง (สมมติ Selector ตามโครงสร้างเว็บเป้าหมาย)
        // tr.price-row คือแถวข้อมูล, .product-name คือชื่อสินค้า, .price-val คือราคา
        $('table#daily-price-table tbody tr').each((index, element) => {
            const name = $(element).find('.product-name').text().trim();
            const minPriceText = $(element).find('.price-min').text().trim(); // เช่น "10.50"
            const maxPriceText = $(element).find('.price-max').text().trim(); // เช่น "12.00"

            if (name && minPriceText) {
                scrapedData.push({
                    name,
                    priceMin: parseFloat(minPriceText),
                    priceMax: parseFloat(maxPriceText) || parseFloat(minPriceText),
                    source: 'ตลาดกลางตัวอย่าง',
                    date: new Date()
                });
            }
        });

        // -----------------------------------------------------------------------
        // 4. บันทึกลง Database (Prisma)
        // -----------------------------------------------------------------------
        let savedCount = 0;

        for (const item of scrapedData) {
            // ค้นหา Product ID จากชื่อ (Mapping Name)
            const product = await db.product.findFirst({
                where: { name: { contains: item.name } } // หาชื่อที่คล้ายกัน
            });

            if (product) {
                // ถ้าเจอพืชในระบบ ให้บันทึกราคา
                await db.marketPrice.create({
                    data: {
                        productId: product.id,
                        sourceName: item.source,
                        priceMin: item.priceMin,
                        priceMax: item.priceMax,
                        dateRecorded: item.date
                    }
                });
                savedCount++;
            }
        }

        console.log(`✅ Sync Completed. Saved ${savedCount} records.`);

        return NextResponse.json({
            success: true,
            message: `ดึงข้อมูลสำเร็จ บันทึกราคา ${savedCount} รายการ`,
            data: scrapedData.slice(0, 5) // ส่งตัวอย่างข้อมูลกลับไป 5 ตัวแรก
        });

    } catch (error) {
        console.error('❌ Sync Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    }
}
