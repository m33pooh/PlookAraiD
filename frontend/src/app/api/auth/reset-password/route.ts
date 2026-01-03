import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            );
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await db.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ' },
                { status: 400 }
            );
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update user password and clear reset token
        await db.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({
            message: 'รีเซ็ตรหัสผ่านสำเร็จ',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
