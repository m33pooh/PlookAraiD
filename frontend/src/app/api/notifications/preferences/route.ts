import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let preferences = await db.notificationPreference.findUnique({
            where: { userId: session.user.id },
        });

        // If no preferences exist, create default ones
        if (!preferences) {
            preferences = await db.notificationPreference.create({
                data: {
                    userId: session.user.id,
                },
            });
        }

        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Error fetching notification preferences:", error);
        return NextResponse.json(
            { error: "Failed to fetch preferences" },
            { status: 500 }
        );
    }
}

// PUT /api/notifications/preferences - Update preferences
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            priceAlerts,
            activityReminders,
            weatherAlerts,
            contractUpdates,
            serviceUpdates,
            questRewards,
            quietHoursStart,
            quietHoursEnd,
        } = body;

        const updateData: Record<string, unknown> = {};
        if (priceAlerts !== undefined) updateData.priceAlerts = priceAlerts;
        if (activityReminders !== undefined) updateData.activityReminders = activityReminders;
        if (weatherAlerts !== undefined) updateData.weatherAlerts = weatherAlerts;
        if (contractUpdates !== undefined) updateData.contractUpdates = contractUpdates;
        if (serviceUpdates !== undefined) updateData.serviceUpdates = serviceUpdates;
        if (questRewards !== undefined) updateData.questRewards = questRewards;
        if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart;
        if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd;

        const preferences = await db.notificationPreference.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...updateData,
            },
            update: updateData,
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return NextResponse.json(
            { error: "Failed to update preferences" },
            { status: 500 }
        );
    }
}
