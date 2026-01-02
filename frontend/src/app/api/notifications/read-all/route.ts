import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            data: { isRead: true },
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
            { error: "Failed to mark notifications as read" },
            { status: 500 }
        );
    }
}
