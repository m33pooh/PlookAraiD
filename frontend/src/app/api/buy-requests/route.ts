import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all buy requests
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const buyerId = searchParams.get('buyerId');
        const status = searchParams.get('status');
        const productId = searchParams.get('productId');

        const buyRequests = await db.buyRequest.findMany({
            where: {
                ...(buyerId && { buyerId }),
                ...(status && { status: status as 'OPEN' | 'CLOSED' | 'FULFILLED' }),
                ...(productId && { productId: parseInt(productId) }),
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                product: true,
                contracts: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(buyRequests);
    } catch (error) {
        console.error('Error fetching buy requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch buy requests' },
            { status: 500 }
        );
    }
}

// POST: Create a new buy request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { buyerId, productId, quantityRequired, priceOffered, description, expiryDate } = body;

        // Validation
        if (!buyerId || !productId || !quantityRequired || !expiryDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const buyRequest = await db.buyRequest.create({
            data: {
                buyerId,
                productId,
                quantityRequired,
                priceOffered: priceOffered || null,
                description: description || null,
                expiryDate: new Date(expiryDate),
                status: 'OPEN',
            },
            include: {
                product: true,
                buyer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(buyRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating buy request:', error);
        return NextResponse.json(
            { error: 'Failed to create buy request' },
            { status: 500 }
        );
    }
}
