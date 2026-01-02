import { db } from '@/lib/db';
import { parseMarketPricesCSV, groupByCategory } from '@/lib/csv-parser';
import { promises as fs } from 'fs';
import path from 'path';
import MarketClient, { MarketPriceData } from '@/components/market/MarketClient';

// Force this page to be Static (built only once at build time)
export const dynamic = 'force-static';

function determinePriceUnit(productName: string): string {
    // Common Thai agricultural price units
    if (productName.includes('ข้าว') || productName.includes('อ้อย')) {
        return 'บาท/ตัน';
    }
    return 'บาท/กก.';
}

export default async function MarketPage() {
    let prices: MarketPriceData[] = [];

    try {
        // 1. Fetch DB Prices
        const dbPrices = await db.marketPrice.findMany({
            include: {
                product: true,
            },
            orderBy: {
                dateRecorded: 'desc',
            },
        });

        prices = dbPrices.map((price) => ({
            id: Number(price.id),
            name: price.product.name,
            category: price.product.category,
            priceMin: Number(price.priceMin),
            priceMax: Number(price.priceMax),
            unit: determinePriceUnit(price.product.name),
            source: price.sourceName,
            lastUpdated: price.dateRecorded.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching market prices from DB:', error);
        // We don't crash the page, just show empty/partial data
    }

    // 2. Fetch CSV Prices
    let csvPrices: any[] = [];
    let categories: string[] = [];

    try {
        const csvPath = path.join(process.cwd(), 'public', 'data', 'market-prices.csv');
        const csvContent = await fs.readFile(csvPath, 'utf-8');
        csvPrices = parseMarketPricesCSV(csvContent);
        const grouped = groupByCategory(csvPrices);
        categories = Object.keys(grouped);
    } catch (error) {
        console.error('Error reading CSV prices:', error);
    }

    return (
        <MarketClient
            initialPrices={prices}
            initialCsvPrices={csvPrices}
            categories={categories}
            lastUpdated={new Date().toISOString()}
        />
    );
}
