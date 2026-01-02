import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get single farm by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const farm = await db.farm.findUnique({
            where: { id },
            include: {
                farmer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                cultivations: {
                    include: {
                        product: true,
                    },
                    orderBy: { startDate: 'desc' },
                },
            },
        });

        if (!farm) {
            return NextResponse.json(
                { error: 'Farm not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(farm);
    } catch (error) {
        console.error('Error fetching farm:', error);
        return NextResponse.json(
            { error: 'Failed to fetch farm' },
            { status: 500 }
        );
    }
}

// PUT: Update farm
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, locationLat, locationLng, areaSize, soilType, waterSource } = body;

        const farm = await db.farm.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(locationLat && { locationLat }),
                ...(locationLng && { locationLng }),
                ...(areaSize && { areaSize }),
                ...(soilType !== undefined && { soilType }),
                ...(waterSource && { waterSource }),
            },
        });

        return NextResponse.json(farm);
    } catch (error) {
        console.error('Error updating farm:', error);
        return NextResponse.json(
            { error: 'Failed to update farm' },
            { status: 500 }
        );
    }
}

// DELETE: Delete farm
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await db.farm.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting farm:', error);
        return NextResponse.json(
            { error: 'Failed to delete farm' },
            { status: 500 }
        );
    }
}
