import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TransportStatus } from "@prisma/client";

// GET - Get request details by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const request = await db.transportRequest.findUnique({
            where: { id },
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
                    include: {
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
                    },
                },
            },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        return NextResponse.json(request);
    } catch (error) {
        console.error("Error fetching transport request:", error);
        return NextResponse.json({ error: "Failed to fetch transport request" }, { status: 500 });
    }
}

// PATCH - Update request status or assign vehicle
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
        const existingRequest = await db.transportRequest.findUnique({
            where: { id },
            include: {
                vehicle: true,
            },
        });

        if (!existingRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Only farmer can update their own request OR vehicle owner can accept
        const isFarmer = existingRequest.farmerId === session.user.id;

        const body = await req.json();
        const { status, vehicleId, priceOffered, notes, isShareable } = body;

        // If assigning vehicle, check if the user owns it
        if (vehicleId) {
            const vehicle = await db.transportVehicle.findUnique({
                where: { id: vehicleId },
            });

            if (!vehicle) {
                return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
            }

            if (vehicle.ownerId !== session.user.id) {
                return NextResponse.json({ error: "Not authorized to assign this vehicle" }, { status: 403 });
            }
        }

        // Validate status transitions
        if (status && !Object.values(TransportStatus).includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedRequest = await db.transportRequest.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(vehicleId !== undefined && { vehicleId }),
                ...(isFarmer && priceOffered !== undefined && { priceOffered }),
                ...(isFarmer && notes !== undefined && { notes }),
                ...(isFarmer && isShareable !== undefined && { isShareable }),
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
                vehicle: {
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
                },
            },
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Error updating transport request:", error);
        return NextResponse.json({ error: "Failed to update transport request" }, { status: 500 });
    }
}

// DELETE - Cancel a transport request
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
        const existingRequest = await db.transportRequest.findUnique({
            where: { id },
        });

        if (!existingRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (existingRequest.farmerId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to delete this request" }, { status: 403 });
        }

        // Only allow cancellation if not completed or in transit
        if (['COMPLETED', 'IN_TRANSIT'].includes(existingRequest.status)) {
            return NextResponse.json(
                { error: "Cannot cancel request that is in transit or completed" },
                { status: 400 }
            );
        }

        await db.transportRequest.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error cancelling transport request:", error);
        return NextResponse.json({ error: "Failed to cancel transport request" }, { status: 500 });
    }
}
