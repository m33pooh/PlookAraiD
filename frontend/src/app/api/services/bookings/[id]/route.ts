
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingStatus } from "../../../../../../prisma/generated/client";

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
        const body = await req.json();
        const { status } = body;

        // Validate status
        if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Check ownership (only provider can accept/reject/progress, farmer can cancel)
        const booking = await db.serviceBooking.findUnique({
            where: { id },
            include: { service: true }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const isProvider = booking.service.providerId === session.user.id;
        const isFarmer = booking.farmerId === session.user.id;

        if (!isProvider && !isFarmer) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Authorization logic
        if (isFarmer && status !== 'CANCELLED') {
            return NextResponse.json({ error: "Farmers can only cancel bookings" }, { status: 403 });
        }

        // Update
        const updatedBooking = await db.serviceBooking.update({
            where: { id },
            data: { status: status as BookingStatus },
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}
