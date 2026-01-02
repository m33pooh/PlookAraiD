import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get single contract by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const contract = await db.contract.findUnique({
            where: { id },
            include: {
                farmer: {
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
                cultivation: {
                    include: {
                        product: true,
                        farm: true,
                    },
                },
                buyRequest: true,
            },
        });

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contract' },
            { status: 500 }
        );
    }
}

// PUT: Update contract (including signing)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { agreedPrice, agreedQuantity, status, signedAt } = body;

        // If signing the contract
        const updateData: Record<string, unknown> = {};

        if (agreedPrice !== undefined) updateData.agreedPrice = agreedPrice;
        if (agreedQuantity !== undefined) updateData.agreedQuantity = agreedQuantity;
        if (status) updateData.status = status;

        // If status is being set to SIGNED, set signedAt
        if (status === 'SIGNED') {
            updateData.signedAt = signedAt ? new Date(signedAt) : new Date();
        }

        const contract = await db.contract.update({
            where: { id },
            data: updateData,
            include: {
                cultivation: {
                    include: {
                        product: true,
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

        return NextResponse.json(contract);
    } catch (error) {
        console.error('Error updating contract:', error);
        return NextResponse.json(
            { error: 'Failed to update contract' },
            { status: 500 }
        );
    }
}

// DELETE: Delete contract (only DRAFT contracts can be deleted)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if contract is in DRAFT status
        const contract = await db.contract.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        if (contract.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Only draft contracts can be deleted' },
                { status: 400 }
            );
        }

        await db.contract.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contract:', error);
        return NextResponse.json(
            { error: 'Failed to delete contract' },
            { status: 500 }
        );
    }
}
