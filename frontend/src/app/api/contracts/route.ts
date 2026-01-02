import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all contracts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const farmerId = searchParams.get('farmerId');
        const buyerId = searchParams.get('buyerId');
        const status = searchParams.get('status');

        const contracts = await db.contract.findMany({
            where: {
                ...(farmerId && { farmerId }),
                ...(buyerId && { buyerId }),
                ...(status && { status: status as 'DRAFT' | 'SIGNED' | 'COMPLETED' | 'CANCELLED' }),
            },
            include: {
                farmer: {
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
                cultivation: {
                    include: {
                        product: true,
                        farm: true,
                    },
                },
                buyRequest: {
                    select: {
                        id: true,
                        description: true,
                    },
                },
            },
            orderBy: { signedAt: 'desc' },
        });

        return NextResponse.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contracts' },
            { status: 500 }
        );
    }
}

// POST: Create a new contract
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cultivationId, buyRequestId, farmerId, buyerId, agreedPrice, agreedQuantity } = body;

        // Validation
        if (!cultivationId || !buyRequestId || !farmerId || !buyerId || !agreedPrice || !agreedQuantity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if cultivation already has a contract
        const existingContract = await db.contract.findUnique({
            where: { cultivationId },
        });

        if (existingContract) {
            return NextResponse.json(
                { error: 'This cultivation already has a contract' },
                { status: 400 }
            );
        }

        const contract = await db.contract.create({
            data: {
                cultivationId,
                buyRequestId,
                farmerId,
                buyerId,
                agreedPrice,
                agreedQuantity,
                status: 'DRAFT',
            },
            include: {
                cultivation: {
                    include: {
                        product: true,
                        farm: true,
                    },
                },
                farmer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(contract, { status: 201 });
    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json(
            { error: 'Failed to create contract' },
            { status: 500 }
        );
    }
}
