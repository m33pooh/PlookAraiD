import { db } from "@/lib/db";
import { Farm, Product, BuyRequest, Cultivation, WaterSource } from "../../prisma/generated/client";

// Types for Recommendation Result
export interface Recommendation {
    product: Product;
    score: number; // 0-100
    reasons: string[];
    warnings: string[];
}

export class SmartMatchingEngine {
    // Configurable weights
    private static WEIGHT_SEASONALITY = 20;
    private static WEIGHT_DEMAND = 20;
    private static WEIGHT_BASE = 50;
    private static OVERSUPPLY_PENALTY = 30;

    /**
     * Main function to get recommendations for a specific farm
     */
    static async getRecommendations(farmId: string): Promise<Recommendation[]> {
        // 1. Fetch necessary data
        const farm = await db.farm.findUnique({
            where: { id: farmId },
        });

        if (!farm) {
            throw new Error("Farm not found");
        }

        const products = await db.product.findMany();

        // Fetch active buy requests (Demand) - In a real app, filter by location radius
        const activeBuyRequests = await db.buyRequest.findMany({
            where: {
                status: "OPEN",
                expiryDate: { gte: new Date() },
            },
        });

        // Fetch active cultivations (Supply) - To detect saturation
        // In a real app, query by lat/lng radius
        const nearbyCultivations = await db.cultivation.findMany({
            where: {
                status: { in: ["PLANNING", "GROWING"] },
                // Simulate "nearby" by excluding own farm (naive approach for now)
                farmId: { not: farmId },
            },
        });

        // 2. Calculate score for each product
        const recommendations: Recommendation[] = [];

        for (const product of products) {
            const { score, reasons, warnings } = this.calculateScore(
                farm,
                product,
                activeBuyRequests,
                nearbyCultivations
            );

            recommendations.push({
                product,
                score,
                reasons,
                warnings,
            });
        }

        // 3. Sort by score descending
        return recommendations.sort((a, b) => b.score - a.score);
    }

    /**
     * Scoring Logic
     */
    private static calculateScore(
        farm: Farm,
        product: Product,
        buyRequests: BuyRequest[],
        allCultivations: Cultivation[]
    ): { score: number; reasons: string[]; warnings: string[] } {
        let score = this.WEIGHT_BASE;
        const reasons: string[] = [];
        const warnings: string[] = [];

        // --- 1. Seasonality Check ---
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const suitableMonths = product.suitableMonths as number[] | null;

        if (suitableMonths && Array.isArray(suitableMonths)) {
            if (suitableMonths.includes(currentMonth)) {
                score += this.WEIGHT_SEASONALITY;
                reasons.push("In Season (Suitable for planting now)");
            } else {
                // Optional: Penalize if strictly out of season?
                // score -= 10;
                // warnings.push("Out of Season");
            }
        }

        // --- 2. Demand Check (Buy Requests) ---
        // Filter requests for this specific product
        // TODO: Add distance filter here using farm lat/lng vs request location (if buyer has location)
        const demandCount = buyRequests.filter((req) => req.productId === product.id).length;

        if (demandCount > 0) {
            // Cap the bonus?
            const demandBonus = Math.min(demandCount * 10, 30); // Max 30 points for demand
            score += demandBonus;
            reasons.push(`High Demand (${demandCount} active requests)`);
        }

        // --- 3. Oversupply Risk (Neighbors) ---
        // Count how many neighbors are growing this
        const competitors = allCultivations.filter((c) => c.productId === product.id).length;

        if (competitors > 5) {
            score -= this.OVERSUPPLY_PENALTY;
            warnings.push(`Risk of Oversupply (${competitors} nearby farms growing this)`);
        }

        // --- 4. Suitability (Soil/Water) ---
        // Naive string matching for demo
        if (farm.soilType && product.name.toLowerCase().includes("rice") && !farm.soilType.toLowerCase().includes("clay")) {
            // Example: Rice needs Clay soil. If farm not clay, penalize.
            // This is just a placeholder logic.
        }

        // Water Check
        if (product.category === "AQUATIC" && farm.waterSource === WaterSource.RAIN) {
            score -= 50; // Heavily penalize aquatic farming if only rain fed
            warnings.push("Insufficient water source for aquatic animals");
        }

        // Clamp score 0-100
        score = Math.max(0, Math.min(100, score));

        return { score, reasons, warnings };
    }
}
