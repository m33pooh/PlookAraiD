import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type (basic check)
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json(
                { success: false, error: 'File must be a CSV' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/data/market-prices.csv
        const uploadDir = path.join(process.cwd(), 'public', 'data');
        const filePath = path.join(uploadDir, 'market-prices.csv');

        await writeFile(filePath, buffer);

        console.log(`File saved to ${filePath}`);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            filename: file.name
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload file',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
