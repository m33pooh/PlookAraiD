import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมล' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await db.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return NextResponse.json({
                message: 'หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่าน',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Store token in database (using a separate field or table)
        // For simplicity, we'll store it in user's record
        await db.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry,
            },
        });

        // In production, send email here with:
        // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        // await sendEmail({ to: email, subject: 'รีเซ็ตรหัสผ่าน', html: `...${resetUrl}...` });

        // For development, log the token
        console.log('Password reset token:', resetToken);
        console.log('Reset URL:', `/reset-password?token=${resetToken}`);

        return NextResponse.json({
            message: 'หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่าน',
            // Only include token in development
            ...(process.env.NODE_ENV === 'development' && { devToken: resetToken }),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
