import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all farms (for demo, returns all; in production, filter by authenticated user)
export async function GET() {
    try {
        const farms = await db.farm.findMany({
            include: {
                farmer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                cultivations: {
                    where: {
                        status: {
                            in: ['PLANNING', 'GROWING'],
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch farms' },
            { status: 500 }
        );
    }
}

// POST: Create a new farm
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { farmerId, name, locationLat, locationLng, areaSize, soilType, waterSource } = body;

        // Validation
        if (!farmerId || !name || !locationLat || !locationLng || !areaSize || !waterSource) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const farm = await db.farm.create({
            data: {
                farmerId,
                name,
                locationLat,
                locationLng,
                areaSize,
                soilType: soilType || null,
                waterSource,
            },
        });

        return NextResponse.json(farm, { status: 201 });
    } catch (error) {
        console.error('Error creating farm:', error);
        return NextResponse.json(
            { error: 'Failed to create farm' },
            { status: 500 }
        );
    }
}
