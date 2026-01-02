import { NextResponse } from 'next/server';
import { parseMarketPricesCSV, groupByCategory, getExpensiveItems, getCheapItems } from '@/lib/csv-parser';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const filter = searchParams.get('filter'); // 'expensive' | 'cheap'

        // Read CSV file from public/data folder
        const csvPath = path.join(process.cwd(), 'public', 'data', 'market-prices.csv');
        const csvContent = await fs.readFile(csvPath, 'utf-8');

        // Parse CSV content
        let prices = parseMarketPricesCSV(csvContent);

        // Apply filters if specified
        if (filter === 'expensive') {
            prices = getExpensiveItems(prices);
        } else if (filter === 'cheap') {
            prices = getCheapItems(prices);
        }

        // Filter by category if specified
        if (category) {
            prices = prices.filter(p => p.category === category);
        }

        // Get grouped data as well
        const grouped = groupByCategory(prices);

        return NextResponse.json({
            success: true,
            data: prices,
            grouped,
            totalItems: prices.length,
            categories: Object.keys(grouped),
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading CSV prices:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to read market prices from CSV',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
