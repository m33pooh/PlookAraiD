import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get single cultivation by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const cultivation = await db.cultivation.findUnique({
            where: { id },
            include: {
                farm: {
                    include: {
                        farmer: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                product: true,
                contract: {
                    include: {
                        buyer: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cultivation) {
            return NextResponse.json(
                { error: 'Cultivation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(cultivation);
    } catch (error) {
        console.error('Error fetching cultivation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cultivation' },
            { status: 500 }
        );
    }
}

// PUT: Update cultivation (including status updates)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { startDate, expectedHarvestDate, estimatedYield, status, actualYield } = body;

        const cultivation = await db.cultivation.update({
            where: { id },
            data: {
                ...(startDate && { startDate: new Date(startDate) }),
                ...(expectedHarvestDate && { expectedHarvestDate: new Date(expectedHarvestDate) }),
                ...(estimatedYield !== undefined && { estimatedYield }),
                ...(status && { status }),
                // Note: actualYield would need to be added to schema if needed
            },
            include: {
                farm: true,
                product: true,
            },
        });

        return NextResponse.json(cultivation);
    } catch (error) {
        console.error('Error updating cultivation:', error);
        return NextResponse.json(
            { error: 'Failed to update cultivation' },
            { status: 500 }
        );
    }
}

// DELETE: Delete cultivation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await db.cultivation.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting cultivation:', error);
        return NextResponse.json(
            { error: 'Failed to delete cultivation' },
            { status: 500 }
        );
    }
}
