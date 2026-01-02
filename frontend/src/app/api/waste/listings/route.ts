import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const status = searchParams.get("status") || "AVAILABLE";
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        const radius = searchParams.get("radius") || "50"; // km

        const where: any = {
            status: status as any,
        };

        if (category) {
            where.category = category;
        }

        const listings = await db.biomassListing.findMany({
            where,
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
            orderBy: {
                createdAt: "desc",
            },
        });

        // If location provided, filter by distance (Haversine formula - simple version)
        let filteredListings = listings;
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const radiusKm = parseFloat(radius);

            filteredListings = listings.filter((listing) => {
                const listingLat = parseFloat(listing.locationLat.toString());
                const listingLng = parseFloat(listing.locationLng.toString());
                const distance = calculateDistance(userLat, userLng, listingLat, listingLng);
                return distance <= radiusKm;
            });
        }

        return NextResponse.json(filteredListings);
    } catch (error) {
        console.error("Error fetching waste listings:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            category,
            title,
            description,
            quantity,
            unit,
            pricePerUnit,
            locationLat,
            locationLng,
            locationName,
            imageUrl,
            availableUntil,
        } = body;

        const listing = await db.biomassListing.create({
            data: {
                sellerId: session.user.id,
                category,
                title,
                description,
                quantity,
                unit: unit || "kg",
                pricePerUnit,
                locationLat,
                locationLng,
                locationName,
                imageUrl,
                availableUntil: availableUntil ? new Date(availableUntil) : null,
                status: "AVAILABLE",
            },
        });

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error creating waste listing:", error);
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
