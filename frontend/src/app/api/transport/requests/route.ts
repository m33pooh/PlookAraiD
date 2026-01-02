import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TransportStatus } from "@prisma/client";

// GET - List transport requests with filtering
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const farmerId = searchParams.get("farmerId");
    const isShareable = searchParams.get("shareable");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const whereClause: any = {};

    // Filter by status
    if (status && Object.values(TransportStatus).includes(status as TransportStatus)) {
        whereClause.status = status as TransportStatus;
    }

    // Filter by farmer (for "my requests" view)
    if (farmerId) {
        whereClause.farmerId = farmerId;
    }

    // Filter shareable requests for co-transportation
    if (isShareable === 'true') {
        whereClause.isShareable = true;
        whereClause.status = 'OPEN'; // Only show open shareable requests
    }

    // Filter by date range
    if (dateFrom || dateTo) {
        whereClause.requestedDate = {};
        if (dateFrom) {
            whereClause.requestedDate.gte = new Date(dateFrom);
        }
        if (dateTo) {
            whereClause.requestedDate.lte = new Date(dateTo);
        }
    }

    try {
        const requests = await db.transportRequest.findMany({
            where: whereClause,
            include: {
                farmer: {
                    select: {
                        id: true,
                        username: true,
                        phoneNumber: true,
                        profile: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                vehicle: {
                    select: {
                        id: true,
                        vehicleType: true,
                        licensePlate: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                phoneNumber: true,
                                profile: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                routeParticipations: {
                    include: {
                        route: true,
                    },
                },
            },
            orderBy: {
                requestedDate: 'asc'
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching transport requests:", error);
        return NextResponse.json({ error: "Failed to fetch transport requests" }, { status: 500 });
    }
}

// POST - Create a new transport request
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            pickupLat,
            pickupLng,
            dropoffLat,
            dropoffLng,
            pickupAddress,
            dropoffAddress,
            cargoType,
            cargoWeight,
            requestedDate,
            priceOffered,
            notes,
            isShareable
        } = body;

        // Validate required fields
        if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng || !cargoType || !cargoWeight || !requestedDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const request = await db.transportRequest.create({
            data: {
                farmerId: session.user.id,
                pickupLat,
                pickupLng,
                dropoffLat,
                dropoffLng,
                pickupAddress,
                dropoffAddress,
                cargoType,
                cargoWeight,
                requestedDate: new Date(requestedDate),
                priceOffered,
                notes,
                isShareable: isShareable || false,
            },
            include: {
                farmer: {
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
        });

        return NextResponse.json(request);
    } catch (error) {
        console.error("Error creating transport request:", error);
        return NextResponse.json({ error: "Failed to create transport request" }, { status: 500 });
    }
}
