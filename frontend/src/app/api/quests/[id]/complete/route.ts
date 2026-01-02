import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Complete a quest and earn points
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: questId } = await params;

        // Verify quest exists and is active
        const quest = await db.quest.findUnique({
            where: { id: questId },
        });

        if (!quest) {
            return NextResponse.json({ error: "Quest not found" }, { status: 404 });
        }

        if (!quest.isActive) {
            return NextResponse.json({ error: "Quest is not active" }, { status: 400 });
        }

        // Check if already completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingCompletion = await db.questCompletion.findFirst({
            where: {
                userId: session.user.id,
                questId,
                completedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        if (existingCompletion) {
            return NextResponse.json(
                { error: "Quest already completed today" },
                { status: 400 }
            );
        }

        // Create completion and award points in a transaction
        const result = await db.$transaction(async (tx) => {
            // Create completion record
            const completion = await tx.questCompletion.create({
                data: {
                    userId: session.user.id,
                    questId,
                    pointsAwarded: quest.pointsReward,
                },
            });

            // Update user's points
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    gamificationPoints: { increment: quest.pointsReward },
                },
                select: { gamificationPoints: true },
            });

            // Record point transaction
            await tx.pointTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "EARNED",
                    points: quest.pointsReward,
                    description: `ภารกิจ: ${quest.title}`,
                },
            });

            return {
                completion,
                newPointsBalance: updatedUser.gamificationPoints,
                pointsEarned: quest.pointsReward,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error completing quest:", error);
        return NextResponse.json({ error: "Failed to complete quest" }, { status: 500 });
    }
}
