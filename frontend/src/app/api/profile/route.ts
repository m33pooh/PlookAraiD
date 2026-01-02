import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/profile - Get current user's profile
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                phoneNumber: true,
                role: true,
                profile: {
                    select: {
                        fullName: true,
                        address: true,
                        bio: true,
                        avatarUrl: true,
                        locationLat: true,
                        locationLng: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PUT /api/profile - Update current user's profile
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fullName, bio, avatarUrl, phoneNumber, address, locationLat, locationLng } = body;

        // Update user's phoneNumber directly on User model
        const userUpdateData: { phoneNumber?: string } = {};
        if (phoneNumber !== undefined) {
            userUpdateData.phoneNumber = phoneNumber || null;
        }

        if (Object.keys(userUpdateData).length > 0) {
            await db.user.update({
                where: { id: session.user.id },
                data: userUpdateData,
            });
        }

        // Update or create UserProfile
        const profileData: {
            fullName?: string | null;
            bio?: string | null;
            avatarUrl?: string | null;
            address?: string | null;
            locationLat?: number | null;
            locationLng?: number | null;
        } = {};

        if (fullName !== undefined) profileData.fullName = fullName || null;
        if (bio !== undefined) profileData.bio = bio || null;
        if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl || null;
        if (address !== undefined) profileData.address = address || null;
        if (locationLat !== undefined) profileData.locationLat = locationLat || null;
        if (locationLng !== undefined) profileData.locationLng = locationLng || null;

        const profile = await db.userProfile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...profileData,
            },
            update: profileData,
        });

        // Fetch updated user with profile
        const updatedUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                phoneNumber: true,
                role: true,
                profile: {
                    select: {
                        fullName: true,
                        address: true,
                        bio: true,
                        avatarUrl: true,
                        locationLat: true,
                        locationLng: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
