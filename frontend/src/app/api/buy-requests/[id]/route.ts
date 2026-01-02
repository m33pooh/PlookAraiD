import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get single buy request by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const buyRequest = await db.buyRequest.findUnique({
            where: { id },
            include: {
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phoneNumber: true,
                        profile: {
                            select: {
                                fullName: true,
                                address: true,
                            },
                        },
                    },
                },
                product: true,
                contracts: {
                    include: {
                        farmer: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                        cultivation: {
                            include: {
                                farm: true,
                            },
                        },
                    },
                },
            },
        });

        if (!buyRequest) {
            return NextResponse.json(
                { error: 'Buy request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(buyRequest);
    } catch (error) {
        console.error('Error fetching buy request:', error);
        return NextResponse.json(
            { error: 'Failed to fetch buy request' },
            { status: 500 }
        );
    }
}

// PUT: Update buy request
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { quantityRequired, priceOffered, description, expiryDate, status } = body;

        const buyRequest = await db.buyRequest.update({
            where: { id },
            data: {
                ...(quantityRequired !== undefined && { quantityRequired }),
                ...(priceOffered !== undefined && { priceOffered }),
                ...(description !== undefined && { description }),
                ...(expiryDate && { expiryDate: new Date(expiryDate) }),
                ...(status && { status }),
            },
            include: {
                product: true,
            },
        });

        return NextResponse.json(buyRequest);
    } catch (error) {
        console.error('Error updating buy request:', error);
        return NextResponse.json(
            { error: 'Failed to update buy request' },
            { status: 500 }
        );
    }
}

// DELETE: Delete buy request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await db.buyRequest.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting buy request:', error);
        return NextResponse.json(
            { error: 'Failed to delete buy request' },
            { status: 500 }
        );
    }
}
