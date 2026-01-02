import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/notifications/[id] - Mark notification as read
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

        // Verify ownership
        const notification = await db.notification.findUnique({
            where: { id },
        });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        const updated = await db.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}

// DELETE /api/notifications/[id] - Delete notification
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
        const notification = await db.notification.findUnique({
            where: { id },
        });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        await db.notification.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
            { error: "Failed to delete notification" },
            { status: 500 }
        );
    }
}
