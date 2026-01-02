import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/price-alerts - Fetch user's price alerts
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const priceAlerts = await db.priceAlert.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ priceAlerts });
    } catch (error) {
        console.error("Error fetching price alerts:", error);
        return NextResponse.json(
            { error: "Failed to fetch price alerts" },
            { status: 500 }
        );
    }
}

// POST /api/price-alerts - Create new price alert
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { productId, targetPrice, isAbove } = body;

        if (!productId || targetPrice === undefined) {
            return NextResponse.json(
                { error: "productId and targetPrice are required" },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await db.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check for duplicate alert
        const existing = await db.priceAlert.findFirst({
            where: {
                userId: session.user.id,
                productId,
                targetPrice,
                isAbove: isAbove ?? true,
                isActive: true,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "A similar price alert already exists" },
                { status: 409 }
            );
        }

        const priceAlert = await db.priceAlert.create({
            data: {
                userId: session.user.id,
                productId,
                targetPrice,
                isAbove: isAbove ?? true,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(priceAlert, { status: 201 });
    } catch (error) {
        console.error("Error creating price alert:", error);
        return NextResponse.json(
            { error: "Failed to create price alert" },
            { status: 500 }
        );
    }
}
