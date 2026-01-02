import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Get vehicle details by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const vehicle = await db.transportVehicle.findUnique({
            where: { id },
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
                transportRequests: {
                    where: {
                        status: { in: ['OPEN', 'MATCHED', 'IN_TRANSIT'] }
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
            },
        });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
    }
}

// PATCH - Update vehicle details
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Check ownership
        const existingVehicle = await db.transportVehicle.findUnique({
            where: { id },
        });

        if (!existingVehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        if (existingVehicle.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to update this vehicle" }, { status: 403 });
        }

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
            imageUrl,
            isAvailable
        } = body;

        const updatedVehicle = await db.transportVehicle.update({
            where: { id },
            data: {
                ...(vehicleType && { vehicleType }),
                ...(capacity !== undefined && { capacity }),
                ...(description !== undefined && { description }),
                ...(licensePlate !== undefined && { licensePlate }),
                ...(basePricePerKm !== undefined && { basePricePerKm }),
                ...(locationLat !== undefined && { locationLat }),
                ...(locationLng !== undefined && { locationLng }),
                ...(serviceRadius !== undefined && { serviceRadius }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(isAvailable !== undefined && { isAvailable }),
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

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
    }
}

// DELETE - Remove a vehicle listing
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Check ownership
        const existingVehicle = await db.transportVehicle.findUnique({
            where: { id },
        });

        if (!existingVehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        if (existingVehicle.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to delete this vehicle" }, { status: 403 });
        }

        await db.transportVehicle.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
    }
}
