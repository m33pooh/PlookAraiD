import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get user's points balance and transaction history
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        // Get user's current points
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { gamificationPoints: true },
        });

        // Get recent transactions
        const transactions = await db.pointTransaction.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                rewardItem: {
                    select: {
                        name: true,
                        category: true,
                    },
                },
            },
        });

        // Get stats
        const stats = await db.pointTransaction.aggregate({
            where: { userId: session.user.id },
            _sum: {
                points: true,
            },
        });

        const earnedTotal = await db.pointTransaction.aggregate({
            where: {
                userId: session.user.id,
                type: "EARNED",
            },
            _sum: { points: true },
        });

        const redeemedTotal = await db.pointTransaction.aggregate({
            where: {
                userId: session.user.id,
                type: "REDEEMED",
            },
            _sum: { points: true },
        });

        return NextResponse.json({
            balance: user?.gamificationPoints || 0,
            transactions,
            stats: {
                totalEarned: earnedTotal._sum.points || 0,
                totalRedeemed: Math.abs(redeemedTotal._sum.points || 0),
            },
        });
    } catch (error) {
        console.error("Error fetching user points:", error);
        return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 });
    }
}
