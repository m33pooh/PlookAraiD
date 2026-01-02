
import { PrismaClient, ServiceCategory } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Services...');

    // Create a provider user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const provider = await prisma.user.upsert({
        where: { email: 'provider@example.com' },
        update: {},
        create: {
            email: 'provider@example.com',
            username: 'provider_demo',
            passwordHash: hashedPassword,
            role: 'FARMER', // Or create a generic role if needed, but FARMER can provide services
            isVerified: true,
            phoneNumber: '0812345678',
            profile: {
                create: {
                    fullName: 'สมชาย บริการเกษตร',
                    bio: 'บริการรถไถ รถเกี่ยว และโดรนพ่นยา ครบวงจร ประสบการณ์ 10 ปี',
                    address: '123 หมู่ 4 ต.หนองนา อ.เมือง จ.ขอนแก่น'
                }
            }
        },
    });

    console.log('Provider created:', provider.id);

    // Create services
    const servicesData = [
        {
            title: 'บริการรถไถพรวนดิน',
            description: 'รถไถคูโบต้า 50 แรงม้า พร้อมผานพรวน 3 และ 7 รับงานโซนขอนแก่นและใกล้เคียง',
            category: ServiceCategory.PLOUGHING,
            price: 350,
            priceUnit: 'ต่อไร่',
            locationLat: 16.4329,
            locationLng: 102.8236,
            serviceRadius: 30,
            imageUrl: 'https://images.unsplash.com/photo-1599939571322-792a326l4c5a?w=800&q=80',
        },
        {
            title: 'โดรนพ่นยาเกษตร DJI T30',
            description: 'บริการพ่นยาฮอร์โมน ปุ๋ยน้ำ ด้วยโดรนเกษตร DJI T30 รวดเร็ว ทั่วถึง ประหยัดเวลา',
            category: ServiceCategory.DRONE_SPRAYING,
            price: 120,
            priceUnit: 'ต่อไร่',
            locationLat: 16.4400,
            locationLng: 102.8300,
            serviceRadius: 50,
            imageUrl: 'https://images.unsplash.com/photo-1624397772420-17983b6329c2?w=800&q=80',
        },
        {
            title: 'รถเกี่ยวนวดข้าว Kubota DC-70',
            description: 'รับจ้างเกี่ยวข้าวนาปี นาปรัง เมล็ดพันธุ์สะอาด สูญเสียน้อย',
            category: ServiceCategory.HARVESTING,
            price: 600,
            priceUnit: 'ต่อไร่',
            locationLat: 16.4200,
            locationLng: 102.8100,
            serviceRadius: 40,
            imageUrl: 'https://images.unsplash.com/photo-1595126732328-910a9754407b?w=800&q=80',
        },
        {
            title: 'แรงงานขนย้ายผลผลิต',
            description: 'ทีมงาน 5 คน รับจ้างขนย้ายข้าว มันสำปะหลัง อ้อย ขึ้นรถบรรทุก',
            category: ServiceCategory.LABOR,
            price: 500,
            priceUnit: 'ต่อวัน/คน',
            locationLat: 16.4350,
            locationLng: 102.8250,
            serviceRadius: 20,
            imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03c779979?w=800&q=80',
        }
    ];

    for (const s of servicesData) {
        await prisma.service.create({
            data: {
                providerId: provider.id,
                isAvailable: true,
                ...s,
            }
        });
    }

    console.log('Services seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
