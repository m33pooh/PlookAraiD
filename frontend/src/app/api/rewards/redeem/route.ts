import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Redeem a reward
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { rewardItemId } = body;

        // Get the reward item
        const reward = await db.rewardItem.findUnique({
            where: { id: rewardItemId },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        if (!reward.isActive) {
            return NextResponse.json({ error: "Reward is no longer available" }, { status: 400 });
        }

        // Check stock
        if (reward.stockQuantity !== null && reward.stockQuantity <= 0) {
            return NextResponse.json({ error: "Reward is out of stock" }, { status: 400 });
        }

        // Check user has enough points
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { gamificationPoints: true },
        });

        if (!user || user.gamificationPoints < reward.pointsCost) {
            return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
        }

        // Process redemption in a transaction
        const result = await db.$transaction(async (tx) => {
            // Deduct points
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    gamificationPoints: { decrement: reward.pointsCost },
                },
                select: { gamificationPoints: true },
            });

            // Reduce stock if tracked
            if (reward.stockQuantity !== null) {
                await tx.rewardItem.update({
                    where: { id: rewardItemId },
                    data: { stockQuantity: { decrement: 1 } },
                });
            }

            // Record transaction
            const transaction = await tx.pointTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "REDEEMED",
                    points: -reward.pointsCost,
                    description: `แลกของรางวัล: ${reward.name}`,
                    rewardItemId,
                },
            });

            return {
                transaction,
                newPointsBalance: updatedUser.gamificationPoints,
                redeemedReward: reward,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error redeeming reward:", error);
        return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 });
    }
}
