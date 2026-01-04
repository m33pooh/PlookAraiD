
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path as needed
import { db as prisma } from "@/lib/db"; // Adjust path as needed
import { Cultivation, Product, Contract, Farm } from "@prisma/client";

// Define a type for the cultivation with its relations
type CultivationWithRelations = Cultivation & {
    product: Product;
    contract: Contract | null;
};

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "FARMER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const farmerId = session.user.id;

    try {
        // 1. Fetch Cultivations for Yield History and Cost Analysis
        const cultivations: CultivationWithRelations[] = await prisma.cultivation.findMany({
            where: {
                farm: {
                    farmerId: farmerId,
                },
            },
            include: {
                product: true,
                contract: true, // For revenue if contract exists
            },
            orderBy: {
                expectedHarvestDate: "asc",
            },
        });

        // --- Aggregate Data ---

        // A. Yield History (Group by Month or Harvest Date)
        // We will return a list of { date: string, amount: number, product: string }
        const yieldHistory = cultivations
            .filter((c) => c.status === "HARVESTED" || c.status === "SOLD")
            .map((c) => ({
                date: c.expectedHarvestDate.toISOString().split("T")[0],
                amount: Number(c.estimatedYield || 0),
                product: c.product.name,
                unit: "kg", // Assuming kg for now, usually derived from product/cultivation
            }));

        // B. Financial Performance (Revenue vs Cost)
        // Revenue = Contract agreed price * quantity OR (if SOLD) estimated market price
        // Cost = Product baseCostPerRai * Farm areaSize (Need to fetch farm area from relation or assume/calculate)
        // Actually Cultivation -> Farm, so we can calculate cost.

        // We need to fetch Farm info for areaSize
        const farms = await prisma.farm.findMany({
            where: { farmerId }
        });
        const farmMap = new Map<string, Farm>(farms.map(f => [f.id, f]));

        let totalRevenue = 0;
        let totalCost = 0;

        const financialData = cultivations.map((c) => {
            const farm = farmMap.get(c.farmId);
            const areaSize = Number(farm?.areaSize || 0);
            const baseCost = Number(c.product.baseCostPerRai || 0);
            const cost = areaSize * baseCost;

            // Revenue logic: If contract exists, use agreed price. Else if SOLD, use estimate (mock or 0).
            let revenue = 0;
            if (c.contract && (c.contract.status === "SIGNED" || c.contract.status === "COMPLETED")) {
                revenue = Number(c.contract.agreedPrice) * Number(c.contract.agreedQuantity);
            }

            totalRevenue += revenue;
            totalCost += cost;

            return {
                date: c.expectedHarvestDate.toISOString().split("T")[0],
                revenue,
                cost,
                product: c.product.name
            };
        });

        // C. Crop Performance (Profitability per Product)
        const cropPerformanceMap = new Map<string, { revenue: number; cost: number; yield: number }>();

        cultivations.forEach((c) => {
            const farm = farmMap.get(c.farmId);
            const areaSize = Number(farm?.areaSize || 0);
            const baseCost = Number(c.product.baseCostPerRai || 0);
            const cost = areaSize * baseCost;

            let revenue = 0;
            if (c.contract && (c.contract.status === "SIGNED" || c.contract.status === "COMPLETED")) {
                revenue = Number(c.contract.agreedPrice) * Number(c.contract.agreedQuantity);
            }

            const current = cropPerformanceMap.get(c.product.name) || { revenue: 0, cost: 0, yield: 0 };
            cropPerformanceMap.set(c.product.name, {
                revenue: current.revenue + revenue,
                cost: current.cost + cost,
                yield: current.yield + Number(c.estimatedYield || 0)
            });
        });

        const cropPerformance = Array.from(cropPerformanceMap.entries()).map(([name, data]) => ({
            name,
            profit: data.revenue - data.cost,
            revenue: data.revenue,
            cost: data.cost,
            yield: data.yield
        }));

        return NextResponse.json({
            yieldHistory,
            financialData,
            cropPerformance,
            totals: {
                revenue: totalRevenue,
                cost: totalCost,
                profit: totalRevenue - totalCost
            }
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
