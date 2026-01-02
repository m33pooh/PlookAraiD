import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// PUT /api/profile/password - Change user's password
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
                { status: 400 }
            );
        }

        // Get user with password hash
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, passwordHash: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.user.update({
            where: { id: session.user.id },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { error: "ไม่สามารถเปลี่ยนรหัสผ่านได้" },
            { status: 500 }
        );
    }
}
