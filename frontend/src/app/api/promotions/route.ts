import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/promotions - List all promotions
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const isPublic = searchParams.get('public');

        const where: Record<string, unknown> = {};

        if (status) {
            where.status = status;
        }

        if (isPublic === 'true') {
            where.isPublic = true;
            where.status = 'ACTIVE';
        }

        const promotions = await db.promotion.findMany({
            where,
            include: {
                promoCodes: {
                    where: { isActive: true },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        );
    }
}

// POST /api/promotions - Create new promotion
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const promotion = await db.promotion.create({
            data: {
                name: body.name,
                description: body.description,
                type: body.type,
                discountValue: body.discountValue,
                minPurchase: body.minPurchase,
                maxDiscount: body.maxDiscount,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                status: body.status || 'DRAFT',
                imageUrl: body.imageUrl,
                bannerUrl: body.bannerUrl,
                targetProducts: body.targetProducts || [],
                isPublic: body.isPublic ?? true,
                usageLimit: body.usageLimit,
            },
        });

        return NextResponse.json(promotion, { status: 201 });
    } catch (error) {
        console.error('Error creating promotion:', error);
        return NextResponse.json(
            { error: 'Failed to create promotion' },
            { status: 500 }
        );
    }
}
