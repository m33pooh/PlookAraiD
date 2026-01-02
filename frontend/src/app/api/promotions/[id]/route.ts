import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/promotions/:id
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const promotion = await db.promotion.findUnique({
            where: { id },
            include: {
                promoCodes: true,
            },
        });

        if (!promotion) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(promotion);
    } catch (error) {
        console.error('Error fetching promotion:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotion' },
            { status: 500 }
        );
    }
}

// PUT /api/promotions/:id
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const promotion = await db.promotion.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                type: body.type,
                discountValue: body.discountValue,
                minPurchase: body.minPurchase,
                maxDiscount: body.maxDiscount,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                status: body.status,
                imageUrl: body.imageUrl,
                bannerUrl: body.bannerUrl,
                targetProducts: body.targetProducts,
                isPublic: body.isPublic,
                usageLimit: body.usageLimit,
            },
        });

        return NextResponse.json(promotion);
    } catch (error) {
        console.error('Error updating promotion:', error);
        return NextResponse.json(
            { error: 'Failed to update promotion' },
            { status: 500 }
        );
    }
}

// DELETE /api/promotions/:id
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.promotion.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        return NextResponse.json(
            { error: 'Failed to delete promotion' },
            { status: 500 }
        );
    }
}
