'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST /api/iot/readings - Submit sensor readings (for IoT devices)
export async function POST(request: NextRequest) {
    try {
        // Note: In production, this would use API key auth for IoT devices
        // For now, we'll accept readings with just the device ID
        const body = await request.json();
        const { deviceId, value, unit } = body;

        if (!deviceId || value === undefined || !unit) {
            return NextResponse.json(
                { error: 'deviceId, value, and unit are required' },
                { status: 400 }
            );
        }

        // Verify device exists
        const device = await db.iotDevice.findUnique({
            where: { id: deviceId },
        });

        if (!device) {
            return NextResponse.json(
                { error: 'Device not found' },
                { status: 404 }
            );
        }

        // Create reading and update lastSeenAt
        const [reading] = await db.$transaction([
            db.iotReading.create({
                data: {
                    deviceId,
                    value,
                    unit,
                },
            }),
            db.iotDevice.update({
                where: { id: deviceId },
                data: { lastSeenAt: new Date() },
            }),
        ]);

        return NextResponse.json(reading, { status: 201 });
    } catch (error) {
        console.error('Error creating IoT reading:', error);
        return NextResponse.json(
            { error: 'Failed to create reading' },
            { status: 500 }
        );
    }
}

// GET /api/iot/readings - Get readings for all devices (admin/summary)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const hours = parseInt(searchParams.get('hours') || '24');

        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const readings = await db.iotReading.findMany({
            where: {
                recordedAt: { gte: since },
                device: {
                    farm: {
                        farmerId: session.user.id,
                    },
                },
            },
            include: {
                device: {
                    select: {
                        id: true,
                        name: true,
                        sensorType: true,
                    },
                },
            },
            orderBy: { recordedAt: 'desc' },
            take: 1000, // Limit to prevent huge responses
        });

        return NextResponse.json(readings);
    } catch (error) {
        console.error('Error fetching IoT readings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch readings' },
            { status: 500 }
        );
    }
}
