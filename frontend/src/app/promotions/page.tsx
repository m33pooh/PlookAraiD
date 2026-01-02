import { db } from '@/lib/db';
import PromotionsClient from '@/components/features/PromotionsClient';

// Force this page to be Static (built only once at build time)
export const dynamic = 'force-static';

export default async function PromotionsPage() {
    let promotions: any[] = [];

    try {
        promotions = await db.promotion.findMany({
            where: {
                isPublic: true,
                status: 'ACTIVE',
            },
            include: {
                promoCodes: {
                    where: { isActive: true },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Ensure dates are serializable if passing to client
        // This mapping cleans up the object for props usage
        promotions = promotions.map(p => ({
            ...p,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        }));

    } catch (error) {
        console.error('Error fetching promotions:', error);
    }

    return <PromotionsClient initialPromotions={promotions} />;
}
