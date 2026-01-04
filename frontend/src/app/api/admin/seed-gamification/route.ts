import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Seed initial quests and rewards (admin only)
import { QuestType } from "@prisma/client";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Seed Quests
        const quests = [
            {
                type: QuestType.DAILY_LOGIN,
                title: "เข้าสู่ระบบวันนี้",
                description: "เข้าสู่ระบบแอปวันนี้เพื่อรับแต้ม",
                pointsReward: 10,
                iconName: "LogIn",
            },
            {
                type: QuestType.LOG_ACTIVITY,
                title: "บันทึกกิจกรรม",
                description: "บันทึกกิจกรรมการเพาะปลูกหรือการดูแลแปลง",
                pointsReward: 20,
                iconName: "FileText",
            },
            {
                type: QuestType.PHOTO_UPLOAD,
                title: "ถ่ายภาพแปลง",
                description: "อัปโหลดภาพแปลงเกษตรของคุณ",
                pointsReward: 25,
                iconName: "Camera",
            },
            {
                type: QuestType.MARKET_CHECK,
                title: "เช็คราคาตลาด",
                description: "ดูราคาตลาดวันนี้",
                pointsReward: 15,
                iconName: "BarChart3",
            },
            {
                type: QuestType.PLAN_UPDATE,
                title: "อัปเดตแผนการผลิต",
                description: "สร้างหรืออัปเดตแผนการเพาะปลูก",
                pointsReward: 30,
                iconName: "Target",
            },
            {
                type: QuestType.IOT_CHECK,
                title: "ตรวจสอบเซ็นเซอร์",
                description: "ดูข้อมูลจาก IoT devices ของคุณ",
                pointsReward: 15,
                iconName: "Cpu",
            },
        ];

        for (const quest of quests) {
            await db.quest.upsert({
                where: { id: `quest_${quest.type}` },
                update: quest,
                create: { id: `quest_${quest.type}`, ...quest },
            });
        }

        // Seed Reward Items
        const rewards = [
            {
                id: "reward_fertilizer_100",
                name: "ส่วนลดปุ๋ย 100 บาท",
                description: "ใช้เป็นส่วนลดเมื่อซื้อปุ๋ยจากร้านค้าที่ร่วมรายการ",
                pointsCost: 500,
                category: "fertilizer",
                stockQuantity: null,
            },
            {
                id: "reward_fertilizer_200",
                name: "ส่วนลดปุ๋ย 200 บาท",
                description: "ใช้เป็นส่วนลดเมื่อซื้อปุ๋ยจากร้านค้าที่ร่วมรายการ",
                pointsCost: 900,
                category: "fertilizer",
                stockQuantity: null,
            },
            {
                id: "reward_seeds_vegetable",
                name: "เมล็ดพันธุ์ผัก 1 ซอง",
                description: "เมล็ดพันธุ์ผักสวนครัวคุณภาพดี",
                pointsCost: 300,
                category: "seeds",
                stockQuantity: 50,
            },
            {
                id: "reward_seeds_rice",
                name: "เมล็ดพันธุ์ข้าว 1 กก.",
                description: "เมล็ดพันธุ์ข้าวหอมมะลิ 105 คุณภาพดี",
                pointsCost: 600,
                category: "seeds",
                stockQuantity: 30,
            },
            {
                id: "reward_service_spray",
                name: "ส่วนลดบริการฉีดพ่น 50 บาท",
                description: "ใช้เป็นส่วนลดเมื่อจองบริการฉีดพ่นโดรน",
                pointsCost: 400,
                category: "service",
                stockQuantity: null,
            },
            {
                id: "reward_service_transport",
                name: "ส่วนลดค่าขนส่ง 100 บาท",
                description: "ใช้เป็นส่วนลดค่าบริการขนส่งสินค้าเกษตร",
                pointsCost: 700,
                category: "service",
                stockQuantity: null,
            },
        ];

        for (const reward of rewards) {
            await db.rewardItem.upsert({
                where: { id: reward.id },
                update: reward,
                create: reward,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Seeded quests and rewards",
            questsCount: quests.length,
            rewardsCount: rewards.length,
        });
    } catch (error) {
        console.error("Error seeding data:", error);
        return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
    }
}
