import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get today's available quests for the current user
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get all active quests
        const quests = await db.quest.findMany({
            where: { isActive: true },
            orderBy: { pointsReward: "desc" },
        });

        // Get today's completions for the user
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const completions = await db.questCompletion.findMany({
            where: {
                userId: session.user.id,
                completedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            select: { questId: true },
        });

        const completedQuestIds = new Set(completions.map((c) => c.questId));

        // Add completion status to quests
        const questsWithStatus = quests.map((quest) => ({
            ...quest,
            isCompletedToday: completedQuestIds.has(quest.id),
        }));

        // Get user's current points
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { gamificationPoints: true },
        });

        return NextResponse.json({
            quests: questsWithStatus,
            userPoints: user?.gamificationPoints || 0,
            completedToday: completions.length,
            totalQuests: quests.length,
        });
    } catch (error) {
        console.error("Error fetching quests:", error);
        return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
    }
}
