import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleType, TransportStatus } from "@prisma/client";

// GET - List available shared routes
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const routeDate = searchParams.get("date");
    const vehicleType = searchParams.get("vehicleType");
    const driverId = searchParams.get("driverId");

    const whereClause: any = {
        status: 'OPEN',
    };

    // Filter by date
    if (routeDate) {
        whereClause.routeDate = new Date(routeDate);
    }

    // Filter by vehicle type
    if (vehicleType && Object.values(VehicleType).includes(vehicleType as VehicleType)) {
        whereClause.vehicleType = vehicleType as VehicleType;
    }

    // Filter by driver (for "my routes" view)
    if (driverId) {
        whereClause.driverId = driverId;
        delete whereClause.status; // Show all routes for driver
    }

    try {
        const routes = await db.transportRoute.findMany({
            where: whereClause,
            include: {
                driver: {
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
                participants: {
                    include: {
                        request: {
                            select: {
                                id: true,
                                cargoType: true,
                                cargoWeight: true,
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
                        },
                    },
                },
            },
            orderBy: {
                routeDate: 'asc'
            }
        });

        // Add calculated fields
        const routesWithCapacity = routes.map((route) => {
            const usedCapacity = route.participants.reduce(
                (sum, p) => sum + Number(p.allocatedSpace),
                0
            );
            const remainingCapacity = Number(route.availableCapacity) - usedCapacity;
            return {
                ...route,
                usedCapacity,
                remainingCapacity,
                participantCount: route.participants.length,
            };
        });

        return NextResponse.json(routesWithCapacity);
    } catch (error) {
        console.error("Error fetching transport routes:", error);
        return NextResponse.json({ error: "Failed to fetch transport routes" }, { status: 500 });
    }
}

// POST - Create a new shared route
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            vehicleType,
            routeDate,
            startLat,
            startLng,
            endLat,
            endLng,
            availableCapacity,
            pricePerKm
        } = body;

        // Validate required fields
        if (!vehicleType || !routeDate || !startLat || !startLng || !endLat || !endLng || !availableCapacity || !pricePerKm) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const route = await db.transportRoute.create({
            data: {
                driverId: session.user.id,
                vehicleType,
                routeDate: new Date(routeDate),
                startLat,
                startLng,
                endLat,
                endLng,
                availableCapacity,
                pricePerKm,
            },
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
        });

        return NextResponse.json(route);
    } catch (error) {
        console.error("Error creating transport route:", error);
        return NextResponse.json({ error: "Failed to create transport route" }, { status: 500 });
    }
}
