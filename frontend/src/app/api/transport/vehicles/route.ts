import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleType } from "@prisma/client";

// GET - List available transport vehicles with filtering
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const vehicleType = searchParams.get("type");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");
    const ownerId = searchParams.get("ownerId");

    const whereClause: any = {
        isAvailable: true,
    };

    // Filter by vehicle type
    if (vehicleType && Object.values(VehicleType).includes(vehicleType as VehicleType)) {
        whereClause.vehicleType = vehicleType as VehicleType;
    }

    // Filter by owner (for "my vehicles" view)
    if (ownerId) {
        whereClause.ownerId = ownerId;
        delete whereClause.isAvailable; // Show all vehicles for owner
    }

    try {
        let vehicles = await db.transportVehicle.findMany({
            where: whereClause,
            include: {
                owner: {
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
                _count: {
                    select: {
                        transportRequests: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // If lat/lng provided, calculate distances and filter by radius
        if (latParam && lngParam) {
            const lat = parseFloat(latParam);
            const lng = parseFloat(lngParam);
            const radius = radiusParam ? parseInt(radiusParam) : 50; // default 50km

            vehicles = vehicles.filter((vehicle) => {
                const vehicleLat = Number(vehicle.locationLat);
                const vehicleLng = Number(vehicle.locationLng);
                const distance = calculateDistance(lat, lng, vehicleLat, vehicleLng);
                return distance <= radius;
            }).map((vehicle) => {
                const vehicleLat = Number(vehicle.locationLat);
                const vehicleLng = Number(vehicle.locationLng);
                const distance = calculateDistance(lat, lng, vehicleLat, vehicleLng);
                return { ...vehicle, distance: Math.round(distance * 10) / 10 };
            }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return NextResponse.json(vehicles);
    } catch (error) {
        console.error("Error fetching transport vehicles:", error);
        return NextResponse.json({ error: "Failed to fetch transport vehicles" }, { status: 500 });
    }
}

// POST - Register a new transport vehicle
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            vehicleType,
            capacity,
            description,
            licensePlate,
            basePricePerKm,
            locationLat,
            locationLng,
            serviceRadius,
            imageUrl
        } = body;

        // Validate required fields
        if (!vehicleType || !capacity || !basePricePerKm || !locationLat || !locationLng) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const vehicle = await db.transportVehicle.create({
            data: {
                ownerId: session.user.id,
                vehicleType,
                capacity,
                description,
                licensePlate,
                basePricePerKm,
                locationLat,
                locationLng,
                serviceRadius: serviceRadius || 50,
                imageUrl,
            },
            include: {
                owner: {
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

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error("Error creating transport vehicle:", error);
        return NextResponse.json({ error: "Failed to create transport vehicle" }, { status: 500 });
    }
}

// Haversine formula for calculating distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
