import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // For demo, get first farmer's data
        const farmer = await db.user.findFirst({
            where: { role: 'FARMER' },
            include: {
                profile: true,
            },
        });

        if (!farmer) {
            return NextResponse.json({ error: 'No farmer found' }, { status: 404 });
        }

        // Get farmer's farms
        const farms = await db.farm.findMany({
            where: { farmerId: farmer.id },
        });

        // Calculate total area
        const totalArea = farms.reduce((sum, farm) => sum + Number(farm.areaSize), 0);

        // Get active cultivations
        const activeCultivations = await db.cultivation.findMany({
            where: {
                farm: { farmerId: farmer.id },
                status: { in: ['PLANNING', 'GROWING'] },
            },
            include: {
                product: true,
                farm: true,
            },
            orderBy: { expectedHarvestDate: 'asc' },
        });

        // Get pending contracts (DRAFT status)
        const pendingContracts = await db.contract.count({
            where: {
                farmerId: farmer.id,
                status: 'DRAFT',
            },
        });

        // Get recent market prices for price alerts
        const recentPrices = await db.marketPrice.findMany({
            include: { product: true },
            orderBy: { dateRecorded: 'desc' },
            distinct: ['productId'],
            take: 5,
        });

        // Transform cultivations for frontend
        const cultivationData = activeCultivations.map((cult) => {
            const startDate = new Date(cult.startDate);
            const harvestDate = new Date(cult.expectedHarvestDate);
            const today = new Date();

            const totalDays = Math.ceil((harvestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const progress = Math.min(Math.max(Math.round((elapsedDays / totalDays) * 100), 0), 100);
            const daysLeft = Math.max(Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 0);

            return {
                id: cult.id,
                crop: cult.product.name,
                farm: cult.farm.name,
                progress,
                daysLeft,
                status: cult.status,
            };
        });

        // Transform price alerts
        const priceAlerts = recentPrices.slice(0, 3).map((price) => ({
            crop: price.product.name,
            change: (Math.random() * 10 - 2).toFixed(1), // Mock change for demo
            trend: Math.random() > 0.3 ? 'up' : 'down',
        }));

        return NextResponse.json({
            farmer: {
                id: farmer.id,
                name: farmer.profile?.fullName || farmer.username,
            },
            stats: {
                farms: farms.length,
                totalArea: parseFloat(totalArea.toFixed(2)),
                activeCultivations: activeCultivations.length,
                pendingContracts,
            },
            cultivations: cultivationData,
            priceAlerts,
        });
    } catch (error) {
        console.error('Error fetching farmer stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch farmer stats' },
            { status: 500 }
        );
    }
}
