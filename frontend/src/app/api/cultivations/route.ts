import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all cultivations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const farmId = searchParams.get('farmId');
        const status = searchParams.get('status');

        const cultivations = await db.cultivation.findMany({
            where: {
                ...(farmId && { farmId }),
                ...(status && { status: status as 'PLANNING' | 'GROWING' | 'HARVESTED' | 'SOLD' }),
            },
            include: {
                farm: {
                    select: {
                        id: true,
                        name: true,
                        farmer: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                product: true,
                contract: true,
            },
            orderBy: { startDate: 'desc' },
        });

        return NextResponse.json(cultivations);
    } catch (error) {
        console.error('Error fetching cultivations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cultivations' },
            { status: 500 }
        );
    }
}

// POST: Create a new cultivation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { farmId, productId, startDate, expectedHarvestDate, estimatedYield, status } = body;

        // Validation
        if (!farmId || !productId || !startDate || !expectedHarvestDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cultivation = await db.cultivation.create({
            data: {
                farmId,
                productId,
                startDate: new Date(startDate),
                expectedHarvestDate: new Date(expectedHarvestDate),
                estimatedYield: estimatedYield || null,
                costDetails: body.costDetails,
                activitySchedule: body.activitySchedule,
                status: status || 'PLANNING',
            },
            include: {
                farm: true,
                product: true,
            },
        });

        return NextResponse.json(cultivation, { status: 201 });
    } catch (error) {
        console.error('Error creating cultivation:', error);
        return NextResponse.json(
            { error: 'Failed to create cultivation' },
            { status: 500 }
        );
    }
}
