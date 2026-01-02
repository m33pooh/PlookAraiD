
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ServiceCategory } from "@prisma/client";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    // Basic filtering
    const whereClause: any = {
        isAvailable: true,
    };

    if (category && Object.values(ServiceCategory).includes(category as ServiceCategory)) {
        whereClause.category = category as ServiceCategory;
    }

    // TODO: Implement geospatial filtering if lat/lng are provided
    // For now, return all matching category

    try {
        const services = await db.service.findMany({
            where: whereClause,
            include: {
                provider: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, category, price, priceUnit, locationLat, locationLng, serviceRadius } = body;

        const service = await db.service.create({
            data: {
                providerId: session.user.id,
                title,
                description,
                category,
                price,
                priceUnit,
                locationLat,
                locationLng,
                serviceRadius: serviceRadius || 50,
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}
