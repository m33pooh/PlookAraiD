
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bookings = await db.serviceBooking.findMany({
            where: {
                OR: [
                    { farmerId: session.user.id }, // As a farmer (booker)
                    { service: { providerId: session.user.id } } // As a provider
                ]
            },
            include: {
                service: true,
                farmer: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                fullName: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                bookingDate: 'asc'
            }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { serviceId, cultivationId, bookingDate, notes } = body;

        const booking = await db.serviceBooking.create({
            data: {
                serviceId,
                farmerId: session.user.id,
                cultivationId,
                bookingDate: new Date(bookingDate),
                notes,
                status: 'PENDING'
            },
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}
