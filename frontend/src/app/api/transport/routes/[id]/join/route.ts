import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Join a shared route with a transport request
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: routeId } = await params;

    try {
        const body = await req.json();
        const { requestId, allocatedSpace, agreedPrice } = body;

        // Validate required fields
        if (!requestId || !allocatedSpace || !agreedPrice) {
            return NextResponse.json(
                { error: "Missing required fields: requestId, allocatedSpace, agreedPrice" },
                { status: 400 }
            );
        }

        // Verify route exists and is open
        const route = await db.transportRoute.findUnique({
            where: { id: routeId },
            include: {
                participants: true,
            },
        });

        if (!route) {
            return NextResponse.json({ error: "Route not found" }, { status: 404 });
        }

        if (route.status !== 'OPEN') {
            return NextResponse.json({ error: "Route is no longer accepting participants" }, { status: 400 });
        }

        // Verify request exists and belongs to user
        const request = await db.transportRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return NextResponse.json({ error: "Transport request not found" }, { status: 404 });
        }

        if (request.farmerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to use this request" }, { status: 403 });
        }

        if (request.status !== 'OPEN') {
            return NextResponse.json({ error: "Transport request is not available for joining routes" }, { status: 400 });
        }

        // Check available capacity
        const usedCapacity = route.participants.reduce(
            (sum, p) => sum + Number(p.allocatedSpace),
            0
        );
        const remainingCapacity = Number(route.availableCapacity) - usedCapacity;

        if (Number(allocatedSpace) > remainingCapacity) {
            return NextResponse.json(
                { error: `Insufficient capacity. Only ${remainingCapacity} tons available.` },
                { status: 400 }
            );
        }

        // Check if already participating
        const existingParticipation = await db.transportRouteParticipant.findUnique({
            where: {
                routeId_requestId: {
                    routeId,
                    requestId,
                },
            },
        });

        if (existingParticipation) {
            return NextResponse.json({ error: "Already joined this route" }, { status: 400 });
        }

        // Create participation and update request status
        const [participation] = await db.$transaction([
            db.transportRouteParticipant.create({
                data: {
                    routeId,
                    requestId,
                    allocatedSpace,
                    agreedPrice,
                },
                include: {
                    route: {
                        include: {
                            driver: {
                                select: {
                                    id: true,
                                    username: true,
                                    profile: {
                                        select: {
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    request: true,
                },
            }),
            db.transportRequest.update({
                where: { id: requestId },
                data: { status: 'MATCHED' },
            }),
        ]);

        return NextResponse.json(participation);
    } catch (error) {
        console.error("Error joining transport route:", error);
        return NextResponse.json({ error: "Failed to join transport route" }, { status: 500 });
    }
}
