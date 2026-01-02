import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    username: z.string().min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
    role: z.enum(['FARMER', 'BUYER']),
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password, username, role, fullName, phoneNumber } = parsed.data;

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await db.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user with profile
        const user = await db.user.create({
            data: {
                email,
                username,
                passwordHash,
                role: role as 'FARMER' | 'BUYER',
                phoneNumber: phoneNumber || null,
                profile: {
                    create: {
                        fullName: fullName || null,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        return NextResponse.json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
            { status: 500 }
        );
    }
}
