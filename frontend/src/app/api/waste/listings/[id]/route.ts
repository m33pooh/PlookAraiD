import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const listing = await db.biomassListing.findUnique({
            where: { id },
            include: {
                seller: {
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
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error fetching waste listing:", error);
        return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
}

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
        const body = await req.json();

        // Verify ownership
        const existing = await db.biomassListing.findUnique({
            where: { id },
            select: { sellerId: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (existing.sellerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const {
            title,
            description,
            quantity,
            pricePerUnit,
            status,
            availableUntil,
        } = body;

        const listing = await db.biomassListing.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(quantity && { quantity }),
                ...(pricePerUnit && { pricePerUnit }),
                ...(status && { status }),
                ...(availableUntil !== undefined && {
                    availableUntil: availableUntil ? new Date(availableUntil) : null,
                }),
            },
        });

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error updating waste listing:", error);
        return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }
}

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
        const existing = await db.biomassListing.findUnique({
            where: { id },
            select: { sellerId: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (existing.sellerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.biomassListing.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting waste listing:", error);
        return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }
}
