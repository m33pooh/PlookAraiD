'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { SensorType } from '@prisma/client';

// GET /api/iot/devices - List all IoT devices for user's farms
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all devices from user's farms
        const devices = await db.iotDevice.findMany({
            where: {
                farm: {
                    farmerId: session.user.id,
                },
            },
            include: {
                farm: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                readings: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1, // Get only the latest reading
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transform data to include latest reading
        const devicesWithLatest = devices.map((device) => ({
            ...device,
            latestReading: device.readings[0] || null,
            readings: undefined, // Remove full readings array
        }));

        return NextResponse.json(devicesWithLatest);
    } catch (error) {
        console.error('Error fetching IoT devices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch devices' },
            { status: 500 }
        );
    }
}

// POST /api/iot/devices - Register a new IoT device
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { farmId, name, sensorType, serialNumber, locationLat, locationLng } = body;

        // Validate required fields
        if (!farmId || !name || !sensorType) {
            return NextResponse.json(
                { error: 'farmId, name, and sensorType are required' },
                { status: 400 }
            );
        }

        // Validate sensorType
        if (!Object.values(SensorType).includes(sensorType)) {
            return NextResponse.json(
                { error: 'Invalid sensor type' },
                { status: 400 }
            );
        }

        // Verify farm belongs to user
        const farm = await db.farm.findFirst({
            where: {
                id: farmId,
                farmerId: session.user.id,
            },
        });

        if (!farm) {
            return NextResponse.json(
                { error: 'Farm not found or unauthorized' },
                { status: 404 }
            );
        }

        // Create the device
        const device = await db.iotDevice.create({
            data: {
                farmId,
                name,
                sensorType,
                serialNumber: serialNumber || null,
                locationLat: locationLat || null,
                locationLng: locationLng || null,
            },
            include: {
                farm: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(device, { status: 201 });
    } catch (error) {
        console.error('Error creating IoT device:', error);
        return NextResponse.json(
            { error: 'Failed to create device' },
            { status: 500 }
        );
    }
}
