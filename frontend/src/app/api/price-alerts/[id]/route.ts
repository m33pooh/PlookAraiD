import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/price-alerts/[id] - Update/toggle price alert
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { isActive, targetPrice, isAbove } = body;

        // Verify ownership
        const priceAlert = await db.priceAlert.findUnique({
            where: { id },
        });

        if (!priceAlert || priceAlert.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Price alert not found" },
                { status: 404 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (targetPrice !== undefined) updateData.targetPrice = targetPrice;
        if (isAbove !== undefined) updateData.isAbove = isAbove;

        const updated = await db.priceAlert.update({
            where: { id },
            data: updateData,
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

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating price alert:", error);
        return NextResponse.json(
            { error: "Failed to update price alert" },
            { status: 500 }
        );
    }
}

// DELETE /api/price-alerts/[id] - Delete price alert
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify ownership
        const priceAlert = await db.priceAlert.findUnique({
            where: { id },
        });

        if (!priceAlert || priceAlert.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Price alert not found" },
                { status: 404 }
            );
        }

        await db.priceAlert.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting price alert:", error);
        return NextResponse.json(
            { error: "Failed to delete price alert" },
            { status: 500 }
        );
    }
}
