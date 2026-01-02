import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/notifications - Fetch user's notifications (paginated)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const unreadOnly = searchParams.get("unreadOnly") === "true";
        const type = searchParams.get("type");

        const skip = (page - 1) * limit;

        const whereClause: Record<string, unknown> = {
            userId: session.user.id,
        };

        if (unreadOnly) {
            whereClause.isRead = false;
        }

        if (type) {
            whereClause.type = type;
        }

        // Get notifications
        const [notifications, totalCount, unreadCount] = await Promise.all([
            db.notification.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.notification.count({
                where: { userId: session.user.id },
            }),
            db.notification.count({
                where: { userId: session.user.id, isRead: false },
            }),
        ]);

        return NextResponse.json({
            notifications,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
            unreadCount,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId, type, title, message, link } = body;

        // Allow creating for self, or admin can create for anyone
        const targetUserId = userId || session.user.id;

        const notification = await db.notification.create({
            data: {
                userId: targetUserId,
                type,
                title,
                message,
                link,
            },
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}
