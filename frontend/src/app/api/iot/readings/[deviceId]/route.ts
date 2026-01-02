'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/iot/readings/[deviceId] - Get readings for a specific device
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { deviceId } = await params;
        const { searchParams } = new URL(request.url);
        const hours = parseInt(searchParams.get('hours') || '24');
        const limit = parseInt(searchParams.get('limit') || '100');

        // Verify device belongs to user
        const device = await db.iotDevice.findFirst({
            where: {
                id: deviceId,
                farm: {
                    farmerId: session.user.id,
                },
            },
            include: {
                farm: {
                    select: { name: true },
                },
            },
        });

        if (!device) {
            return NextResponse.json(
                { error: 'Device not found or unauthorized' },
                { status: 404 }
            );
        }

        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const readings = await db.iotReading.findMany({
            where: {
                deviceId,
                recordedAt: { gte: since },
            },
            orderBy: { recordedAt: 'asc' },
            take: limit,
        });

        return NextResponse.json({
            device: {
                id: device.id,
                name: device.name,
                sensorType: device.sensorType,
                farmName: device.farm.name,
            },
            readings: readings.map((r) => ({
                id: r.id.toString(),
                value: r.value,
                unit: r.unit,
                recordedAt: r.recordedAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching device readings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch readings' },
            { status: 500 }
        );
    }
}
