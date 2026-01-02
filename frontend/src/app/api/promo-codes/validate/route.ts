import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/promo-codes/validate - Validate a promo code
export async function POST(request: Request) {
    try {
        const { code, productId } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Promo code is required', valid: false },
                { status: 400 }
            );
        }

        const promoCode = await db.promoCode.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                promotion: true,
            },
        });

        if (!promoCode) {
            return NextResponse.json(
                { error: 'รหัสโปรโมชั่นไม่ถูกต้อง', valid: false },
                { status: 404 }
            );
        }

        const now = new Date();
        const promotion = promoCode.promotion;

        // Check if promo code is active
        if (!promoCode.isActive) {
            return NextResponse.json(
                { error: 'รหัสโปรโมชั่นไม่สามารถใช้งานได้', valid: false },
                { status: 400 }
            );
        }

        // Check if promotion is active
        if (promotion.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'โปรโมชั่นนี้ยังไม่เปิดใช้งาน', valid: false },
                { status: 400 }
            );
        }

        // Check date validity
        if (now < promotion.startDate || now > promotion.endDate) {
            return NextResponse.json(
                { error: 'โปรโมชั่นนี้หมดอายุแล้ว', valid: false },
                { status: 400 }
            );
        }

        // Check promo code specific validity dates
        if (promoCode.validFrom && now < promoCode.validFrom) {
            return NextResponse.json(
                { error: 'รหัสโปรโมชั่นยังไม่สามารถใช้งานได้', valid: false },
                { status: 400 }
            );
        }

        if (promoCode.validUntil && now > promoCode.validUntil) {
            return NextResponse.json(
                { error: 'รหัสโปรโมชั่นหมดอายุแล้ว', valid: false },
                { status: 400 }
            );
        }

        // Check usage limits
        if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
            return NextResponse.json(
                { error: 'รหัสโปรโมชั่นถูกใช้งานครบแล้ว', valid: false },
                { status: 400 }
            );
        }

        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
            return NextResponse.json(
                { error: 'โปรโมชั่นนี้ถูกใช้งานครบแล้ว', valid: false },
                { status: 400 }
            );
        }

        // Check target products
        if (productId && promotion.targetProducts.length > 0) {
            if (!promotion.targetProducts.includes(productId)) {
                return NextResponse.json(
                    { error: 'รหัสโปรโมชั่นไม่สามารถใช้กับสินค้านี้ได้', valid: false },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({
            valid: true,
            promotion: {
                id: promotion.id,
                name: promotion.name,
                type: promotion.type,
                discountValue: promotion.discountValue,
                minPurchase: promotion.minPurchase,
                maxDiscount: promotion.maxDiscount,
            },
        });
    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to validate promo code', valid: false },
            { status: 500 }
        );
    }
}
