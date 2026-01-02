import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseMarketPricesCSV, ParsedMarketPrice } from '@/lib/csv-parser';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/market-prices/import
 * นำเข้าข้อมูลราคาจากไฟล์ CSV ลง database
 */
export async function POST(req: NextRequest) {
    try {
        console.log('🔄 Starting CSV import...');

        // Read CSV file
        const csvPath = path.join(process.cwd(), 'public', 'data', 'market-prices.csv');

        if (!fs.existsSync(csvPath)) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบไฟล์ CSV' },
                { status: 404 }
            );
        }

        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const prices = parseMarketPricesCSV(csvContent);

        console.log(`📊 Parsed ${prices.length} items from CSV`);

        let totalSaved = 0;
        let productsCreated = 0;
        const savedItems: { name: string; source: string }[] = [];

        for (const item of prices) {
            try {
                // Find or create product
                let product = await db.product.findFirst({
                    where: {
                        name: { equals: item.name, mode: 'insensitive' }
                    },
                });

                if (!product) {
                    // Create new product
                    product = await db.product.create({
                        data: {
                            name: item.name,
                            category: 'CROP', // Default category
                            growthDurationDays: 90, // Default
                        },
                    });
                    productsCreated++;
                    console.log(`✅ Created product: ${item.name}`);
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Save price for ตลาดสี่มุมเมือง
                if (item.priceMinSiMum > 0 || item.priceMaxSiMum > 0) {
                    const existingSimum = await db.marketPrice.findFirst({
                        where: {
                            productId: product.id,
                            sourceName: 'ตลาดสี่มุมเมือง',
                            dateRecorded: { gte: today },
                        },
                    });

                    if (existingSimum) {
                        await db.marketPrice.update({
                            where: { id: existingSimum.id },
                            data: {
                                priceMin: item.priceMinSiMum,
                                priceMax: item.priceMaxSiMum,
                            },
                        });
                    } else {
                        await db.marketPrice.create({
                            data: {
                                productId: product.id,
                                sourceName: 'ตลาดสี่มุมเมือง',
                                priceMin: item.priceMinSiMum,
                                priceMax: item.priceMaxSiMum,
                                dateRecorded: new Date(),
                            },
                        });
                    }
                    totalSaved++;
                    savedItems.push({ name: item.name, source: 'ตลาดสี่มุมเมือง' });
                }

                // Save price for ตลาดไท
                if (item.priceMinThai > 0 || item.priceMaxThai > 0) {
                    const existingThai = await db.marketPrice.findFirst({
                        where: {
                            productId: product.id,
                            sourceName: 'ตลาดไท',
                            dateRecorded: { gte: today },
                        },
                    });

                    if (existingThai) {
                        await db.marketPrice.update({
                            where: { id: existingThai.id },
                            data: {
                                priceMin: item.priceMinThai,
                                priceMax: item.priceMaxThai,
                            },
                        });
                    } else {
                        await db.marketPrice.create({
                            data: {
                                productId: product.id,
                                sourceName: 'ตลาดไท',
                                priceMin: item.priceMinThai,
                                priceMax: item.priceMaxThai,
                                dateRecorded: new Date(),
                            },
                        });
                    }
                    totalSaved++;
                    savedItems.push({ name: item.name, source: 'ตลาดไท' });
                }

            } catch (err) {
                console.error(`Error saving ${item.name}:`, err);
            }
        }

        console.log(`✅ Import completed. Products created: ${productsCreated}, Prices saved: ${totalSaved}`);

        return NextResponse.json({
            success: true,
            message: `นำเข้าสำเร็จ! สร้างสินค้าใหม่ ${productsCreated} รายการ, บันทึกราคา ${totalSaved} รายการ`,
            productsCreated,
            pricesSaved: totalSaved,
            sampleItems: savedItems.slice(0, 10),
        });

    } catch (error) {
        console.error('❌ Import Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/market-prices/import
 * Get import status/info
 */
export async function GET() {
    try {
        const csvPath = path.join(process.cwd(), 'public', 'data', 'market-prices.csv');
        const exists = fs.existsSync(csvPath);

        let itemCount = 0;
        if (exists) {
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            const prices = parseMarketPricesCSV(csvContent);
            itemCount = prices.length;
        }

        const productCount = await db.product.count();
        const priceCount = await db.marketPrice.count();

        return NextResponse.json({
            csvFile: {
                exists,
                path: 'public/data/market-prices.csv',
                itemCount,
            },
            database: {
                productCount,
                priceCount,
            },
            usage: {
                method: 'POST',
                description: 'นำเข้าข้อมูลจากไฟล์ CSV ลง database',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get status' },
            { status: 500 }
        );
    }
}
