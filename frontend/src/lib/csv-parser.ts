/**
 * CSV Parser Utility for Market Prices
 * Parses CSV data from the market prices file
 */

export interface MarketPriceCSV {
    category: string;           // หมวดหมู่
    name: string;               // รายการสินค้า
    unit: string;               // หน่วย
    priceSiMumMuang: string;    // ราคาเฉลี่ยตลาดสี่มุมเมือง (บาท)
    priceTalardThai: string;    // ราคาเฉลี่ยตลาดไท (บาท)
    trend: string;              // แนวโน้มราคา
}

export interface ParsedMarketPrice {
    id: number;
    category: string;
    name: string;
    unit: string;
    priceMinSiMum: number;
    priceMaxSiMum: number;
    priceMinThai: number;
    priceMaxThai: number;
    trend: string;
    trendLevel: 'high' | 'medium' | 'low' | 'stable' | 'rising';
}

/**
 * Parse price range string like "140 - 160" or "50" to min/max values
 */
export function parsePriceRange(priceStr: string): { min: number; max: number } {
    const trimmed = priceStr.trim();

    if (trimmed.includes('-')) {
        const parts = trimmed.split('-').map(p => parseFloat(p.trim()));
        return {
            min: parts[0] || 0,
            max: parts[1] || parts[0] || 0
        };
    }

    const single = parseFloat(trimmed);
    return { min: single || 0, max: single || 0 };
}

/**
 * Map Thai trend text to trend level
 */
export function mapTrendLevel(trend: string): ParsedMarketPrice['trendLevel'] {
    const t = trend.toLowerCase();
    if (t.includes('สูง')) return 'high';
    if (t.includes('ปานกลาง')) return 'medium';
    if (t.includes('ต่ำ')) return 'low';
    if (t.includes('ทรงตัว') || t.includes('ปกติ')) return 'stable';
    if (t.includes('ขยับขึ้น') || t.includes('ผันผวน')) return 'rising';
    return 'stable';
}

/**
 * Parse CSV text content into structured market price data
 */
export function parseMarketPricesCSV(csvContent: string): ParsedMarketPrice[] {
    const lines = csvContent.trim().split('\n');

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map((line, index) => {
        // Handle CSV parsing with commas in values
        const columns = parseCSVLine(line);

        const [category, name, unit, priceSiMum, priceThai, trend] = columns;

        const siMumRange = parsePriceRange(priceSiMum || '0');
        const thaiRange = parsePriceRange(priceThai || '0');

        return {
            id: index + 1,
            category: category?.trim() || '',
            name: name?.trim() || '',
            unit: unit?.trim() || '',
            priceMinSiMum: siMumRange.min,
            priceMaxSiMum: siMumRange.max,
            priceMinThai: thaiRange.min,
            priceMaxThai: thaiRange.max,
            trend: trend?.trim() || '',
            trendLevel: mapTrendLevel(trend || '')
        };
    }).filter(item => item.name); // Filter out empty rows
}

/**
 * Parse a single CSV line handling commas properly
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Get prices grouped by category
 */
export function groupByCategory(prices: ParsedMarketPrice[]): Record<string, ParsedMarketPrice[]> {
    return prices.reduce((acc, price) => {
        if (!acc[price.category]) {
            acc[price.category] = [];
        }
        acc[price.category].push(price);
        return acc;
    }, {} as Record<string, ParsedMarketPrice[]>);
}

/**
 * Filter expensive items (high price trend)
 */
export function getExpensiveItems(prices: ParsedMarketPrice[]): ParsedMarketPrice[] {
    return prices.filter(p => p.trendLevel === 'high' || p.priceMinSiMum >= 80);
}

/**
 * Filter cheap items (low price trend)
 */
export function getCheapItems(prices: ParsedMarketPrice[]): ParsedMarketPrice[] {
    return prices.filter(p => p.trendLevel === 'low' || p.priceMaxSiMum <= 20);
}
