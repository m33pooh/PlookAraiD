import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to generate unique promo code
function generatePromoCode(length: number = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// GET /api/promo-codes - List promo codes (optionally for a promotion)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const promotionId = searchParams.get('promotionId');

        const where: Record<string, unknown> = {};
        if (promotionId) {
            where.promotionId = promotionId;
        }

        const promoCodes = await db.promoCode.findMany({
            where,
            include: {
                promotion: {
                    select: {
                        name: true,
                        type: true,
                        discountValue: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(promoCodes);
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promo codes' },
            { status: 500 }
        );
    }
}

// POST /api/promo-codes - Create new promo code
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate code if not provided
        let code = body.code?.toUpperCase();
        if (!code) {
            // Generate unique code
            let attempts = 0;
            while (attempts < 10) {
                code = generatePromoCode();
                const existing = await db.promoCode.findUnique({ where: { code } });
                if (!existing) break;
                attempts++;
            }
        }

        // Check if promotion exists
        const promotion = await db.promotion.findUnique({
            where: { id: body.promotionId },
        });

        if (!promotion) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        const promoCode = await db.promoCode.create({
            data: {
                code,
                promotionId: body.promotionId,
                isActive: body.isActive ?? true,
                usageLimit: body.usageLimit,
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
            },
        });

        return NextResponse.json(promoCode, { status: 201 });
    } catch (error) {
        console.error('Error creating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to create promo code' },
            { status: 500 }
        );
    }
}
