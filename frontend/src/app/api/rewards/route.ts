import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get all available rewards
export async function GET(req: Request) {
    try {
        const rewards = await db.rewardItem.findMany({
            where: { isActive: true },
            orderBy: { pointsCost: "asc" },
        });

        return NextResponse.json(rewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }
}
