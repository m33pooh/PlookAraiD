import { NextRequest, NextResponse } from "next/server";
import { SmartMatchingEngine } from "@/lib/matching-engine";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Assuming you have authOptions exported
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        // 1. Check Auth (Optional but recommended)
        // const session = await getServerSession(authOptions);
        // if (!session) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // 2. Get Query Params
        const searchParams = request.nextUrl.searchParams;
        const farmId = searchParams.get("farmId");

        if (!farmId) {
            return NextResponse.json({ error: "Missing farmId parameter" }, { status: 400 });
        }

        // Verify farm ownership if strict security needed
        // const farm = await db.farm.findFirst({ where: { id: farmId, farmerId: session.user.id }});
        // if (!farm) return NextResponse.json({ error: "Farm not found or access denied" }, { status: 404 });

        // 3. Run Matching Engine
        const recommendations = await SmartMatchingEngine.getRecommendations(farmId);

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("Error in Smart Match API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
