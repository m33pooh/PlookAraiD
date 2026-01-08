import 'dotenv/config';
import { PrismaClient, Role, WaterSource, ProductCategory, DemandStatus, CultivationStatus, ContractStatus, PromotionType, PromotionStatus } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    // Logistics & Transport (depend on User)
    await prisma.transportRouteParticipant.deleteMany();
    await prisma.transportRequest.deleteMany();
    await prisma.transportRoute.deleteMany();
    await prisma.transportVehicle.deleteMany();

    // Services (depend on User, Farm, Cultivation)
    await prisma.serviceBooking.deleteMany();
    await prisma.service.deleteMany();

    // Waste Exchange
    await prisma.biomassListing.deleteMany();

    // Knowledge Base
    await prisma.knowledgeArticle.deleteMany();

    // IoT (depend on Farm)
    await prisma.iotReading.deleteMany();
    await prisma.iotDevice.deleteMany();

    // Gamification & Points
    await prisma.pointTransaction.deleteMany();
    await prisma.questCompletion.deleteMany();
    await prisma.rewardItem.deleteMany();
    await prisma.quest.deleteMany();

    // Notifications & User Preferences
    await prisma.notification.deleteMany();
    await prisma.priceAlert.deleteMany();
    await prisma.notificationPreference.deleteMany();

    // Core Business Logic
    await prisma.promoCode.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.cultivation.deleteMany();
    await prisma.buyRequest.deleteMany();
    await prisma.marketPrice.deleteMany();

    // Core Entities
    await prisma.farm.deleteMany();
    await prisma.product.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    console.log('👤 Creating users...');
    const passwordHash = await hash('ppaapp123', 12);

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@tumaraid.com',
            passwordHash,
            role: Role.ADMIN,
            phoneNumber: '0812345678',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'ผู้ดูแลระบบ',
                    address: 'กรุงเทพมหานคร',
                    bio: 'ผู้ดูแลระบบ TumAraiD',
                },
            },
        },
    });

    const farmer1 = await prisma.user.create({
        data: {
            username: 'somchai_farm',
            email: 'somchai@farmer.com',
            passwordHash,
            role: Role.FARMER,
            phoneNumber: '0891234567',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'สมชาย ทำนา',
                    address: '123 หมู่ 5 ต.บางกระทุ่ม อ.บางกระทุ่ม จ.พิษณุโลก 65110',
                    bio: 'เกษตรกรผู้ปลูกข้าวและพืชไร่มากว่า 20 ปี',
                    avatarUrl: '/avatars/farmer1.jpg',
                },
            },
        },
    });

    const farmer2 = await prisma.user.create({
        data: {
            username: 'supaporn_organic',
            email: 'supaporn@farmer.com',
            passwordHash,
            role: Role.FARMER,
            phoneNumber: '0898765432',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'สุภาพร พืชผัก',
                    address: '45 หมู่ 2 ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000',
                    bio: 'เกษตรอินทรีย์ ปลูกผักปลอดสาร',
                    avatarUrl: '/avatars/farmer2.jpg',
                },
            },
        },
    });

    const farmer3 = await prisma.user.create({
        data: {
            username: 'wichai_rice',
            email: 'wichai@farmer.com',
            passwordHash,
            role: Role.FARMER,
            phoneNumber: '0823456789',
            isVerified: false,
            profile: {
                create: {
                    fullName: 'วิชัย ข้าวหอม',
                    address: '78 หมู่ 8 ต.หนองกุลา อ.บางระกำ จ.พิษณุโลก 65140',
                    bio: 'ผู้เชี่ยวชาญการปลูกข้าวหอมมะลิ',
                },
            },
        },
    });

    const buyer1 = await prisma.user.create({
        data: {
            username: 'cpf_buyer',
            email: 'buyer@cpf.co.th',
            passwordHash,
            role: Role.BUYER,
            phoneNumber: '0234567890',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'บริษัท ซีพีเอฟ (ประเทศไทย) จำกัด',
                    address: '313 อาคารซี.พี. ทาวเวอร์ ถนนสีลม เขตบางรัก กรุงเทพฯ 10500',
                    bio: 'ผู้รับซื้อผลผลิตทางการเกษตรรายใหญ่',
                },
            },
        },
    });

    const buyer2 = await prisma.user.create({
        data: {
            username: 'makro_buyer',
            email: 'buyer@makro.co.th',
            passwordHash,
            role: Role.BUYER,
            phoneNumber: '0234567891',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'บริษัท สยามแม็คโคร จำกัด (มหาชน)',
                    address: '1468 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250',
                    bio: 'ห้างค้าส่งชั้นนำ รับซื้อผักผลไม้คุณภาพ',
                },
            },
        },
    });

    console.log(`✅ Created ${6} users`);

    // Create Products
    console.log('🌾 Creating products...');
    const products = await Promise.all([
        // Crops
        prisma.product.create({
            data: {
                name: 'ข้าวหอมมะลิ 105',
                category: ProductCategory.CROP,
                growthDurationDays: 120,
                suitableMonths: [5, 6, 7],
                baseCostPerRai: 3500,
                imageUrl: '/crops/rice-jasmine.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'ข้าวเหนียว กข6',
                category: ProductCategory.CROP,
                growthDurationDays: 110,
                suitableMonths: [5, 6, 7, 8],
                baseCostPerRai: 3200,
                imageUrl: '/crops/rice-sticky.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'ข้าวโพดเลี้ยงสัตว์',
                category: ProductCategory.CROP,
                growthDurationDays: 110,
                suitableMonths: [1, 2, 6, 7, 11, 12],
                baseCostPerRai: 4200,
                imageUrl: '/crops/corn.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'อ้อย',
                category: ProductCategory.CROP,
                growthDurationDays: 300,
                suitableMonths: [10, 11, 12, 1],
                baseCostPerRai: 5500,
                imageUrl: '/crops/sugarcane.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'มันสำปะหลัง',
                category: ProductCategory.CROP,
                growthDurationDays: 270,
                suitableMonths: [4, 5, 6],
                baseCostPerRai: 3800,
                imageUrl: '/crops/cassava.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'ถั่วเหลือง',
                category: ProductCategory.CROP,
                growthDurationDays: 90,
                suitableMonths: [11, 12, 1, 2],
                baseCostPerRai: 2800,
                imageUrl: '/crops/soybean.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'ถั่วเขียว',
                category: ProductCategory.CROP,
                growthDurationDays: 70,
                suitableMonths: [11, 12, 1],
                baseCostPerRai: 2500,
                imageUrl: '/crops/mungbean.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'มะเขือเทศ',
                category: ProductCategory.CROP,
                growthDurationDays: 75,
                suitableMonths: [10, 11, 12, 1, 2],
                baseCostPerRai: 8500,
                imageUrl: '/crops/tomato.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'พริก',
                category: ProductCategory.CROP,
                growthDurationDays: 90,
                suitableMonths: [9, 10, 11, 12],
                baseCostPerRai: 12000,
                imageUrl: '/crops/chili.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'กะหล่ำปลี',
                category: ProductCategory.CROP,
                growthDurationDays: 80,
                suitableMonths: [10, 11, 12, 1, 2],
                baseCostPerRai: 6500,
                imageUrl: '/crops/cabbage.png',
            },
        }),
        // Livestock
        prisma.product.create({
            data: {
                name: 'ไก่เนื้อ',
                category: ProductCategory.LIVESTOCK,
                growthDurationDays: 45,
                baseCostPerRai: 25000,
                imageUrl: '/livestock/chicken.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'หมูขุน',
                category: ProductCategory.LIVESTOCK,
                growthDurationDays: 180,
                baseCostPerRai: 85000,
                imageUrl: '/livestock/pig.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'วัวเนื้อ',
                category: ProductCategory.LIVESTOCK,
                growthDurationDays: 730,
                baseCostPerRai: 45000,
                imageUrl: '/livestock/cattle.png',
            },
        }),
        // Aquatic
        prisma.product.create({
            data: {
                name: 'ปลานิล',
                category: ProductCategory.AQUATIC,
                growthDurationDays: 180,
                baseCostPerRai: 15000,
                imageUrl: '/aquatic/tilapia.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'กุ้งขาว',
                category: ProductCategory.AQUATIC,
                growthDurationDays: 120,
                baseCostPerRai: 120000,
                imageUrl: '/aquatic/shrimp.png',
            },
        }),
        prisma.product.create({
            data: {
                name: 'ปลาดุก',
                category: ProductCategory.AQUATIC,
                growthDurationDays: 120,
                baseCostPerRai: 12000,
                imageUrl: '/aquatic/catfish.png',
            },
        }),
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create Farms
    console.log('🚜 Creating farms...');
    const farm1 = await prisma.farm.create({
        data: {
            farmerId: farmer1.id,
            name: 'ไร่สมชาย ทำนา',
            locationLat: 16.8211,
            locationLng: 100.2659,
            areaSize: 25,
            soilType: 'ดินเหนียว',
            waterSource: WaterSource.IRRIGATION,
        },
    });

    const farm2 = await prisma.farm.create({
        data: {
            farmerId: farmer1.id,
            name: 'ไร่สมชาย 2',
            locationLat: 16.8150,
            locationLng: 100.2700,
            areaSize: 15,
            soilType: 'ดินร่วน',
            waterSource: WaterSource.GROUNDWATER,
        },
    });

    const farm3 = await prisma.farm.create({
        data: {
            farmerId: farmer2.id,
            name: 'สวนผักอินทรีย์ สุภาพร',
            locationLat: 16.8300,
            locationLng: 100.2800,
            areaSize: 5,
            soilType: 'ดินร่วนปนทราย',
            waterSource: WaterSource.GROUNDWATER,
        },
    });

    const farm4 = await prisma.farm.create({
        data: {
            farmerId: farmer3.id,
            name: 'นาข้าวหอมวิชัย',
            locationLat: 16.7500,
            locationLng: 100.1500,
            areaSize: 50,
            soilType: 'ดินเหนียว',
            waterSource: WaterSource.RAIN,
        },
    });

    console.log(`✅ Created 4 farms`);

    // Create Market Prices (historical data)
    console.log('📊 Creating market prices...');
    const marketPriceData = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Rice prices (product id 1)
        marketPriceData.push({
            productId: products[0].id, // ข้าวหอมมะลิ
            sourceName: 'ตลาดกลางข้าวพิษณุโลก',
            priceMin: 15000 + Math.random() * 500 - 250,
            priceMax: 17000 + Math.random() * 500 - 250,
            dateRecorded: date,
        });

        // Corn prices (product id 3)
        marketPriceData.push({
            productId: products[2].id, // ข้าวโพด
            sourceName: 'สมาคมพ่อค้าข้าวโพด',
            priceMin: 8.5 + Math.random() * 0.5 - 0.25,
            priceMax: 9.5 + Math.random() * 0.5 - 0.25,
            dateRecorded: date,
        });

        // Cassava prices (product id 5)
        marketPriceData.push({
            productId: products[4].id, // มันสำปะหลัง
            sourceName: 'สมาคมโรงแป้งมันสำปะหลังไทย',
            priceMin: 2.8 + Math.random() * 0.3 - 0.15,
            priceMax: 3.2 + Math.random() * 0.3 - 0.15,
            dateRecorded: date,
        });

        // Tomato prices (product id 8)
        marketPriceData.push({
            productId: products[7].id, // มะเขือเทศ
            sourceName: 'ตลาดไท',
            priceMin: 15 + Math.random() * 5 - 2.5,
            priceMax: 25 + Math.random() * 5 - 2.5,
            dateRecorded: date,
        });

        // Chili prices (product id 9)
        marketPriceData.push({
            productId: products[8].id, // พริก
            sourceName: 'ตลาดไท',
            priceMin: 40 + Math.random() * 10 - 5,
            priceMax: 60 + Math.random() * 10 - 5,
            dateRecorded: date,
        });
    }

    await prisma.marketPrice.createMany({
        data: marketPriceData,
    });

    console.log(`✅ Created ${marketPriceData.length} market price records`);

    // Create Buy Requests
    console.log('📝 Creating buy requests...');
    const buyRequest1 = await prisma.buyRequest.create({
        data: {
            buyerId: buyer1.id,
            productId: products[0].id, // ข้าวหอมมะลิ
            quantityRequired: 1000,
            priceOffered: 16500,
            description: 'รับซื้อข้าวหอมมะลิคุณภาพดี ความชื้นไม่เกิน 15%',
            expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: DemandStatus.OPEN,
        },
    });

    const buyRequest2 = await prisma.buyRequest.create({
        data: {
            buyerId: buyer1.id,
            productId: products[2].id, // ข้าวโพด
            quantityRequired: 5000,
            priceOffered: 9.2,
            description: 'รับซื้อข้าวโพดเลี้ยงสัตว์ ความชื้นไม่เกิน 14.5%',
            expiryDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
            status: DemandStatus.OPEN,
        },
    });

    const buyRequest3 = await prisma.buyRequest.create({
        data: {
            buyerId: buyer2.id,
            productId: products[7].id, // มะเขือเทศ
            quantityRequired: 500,
            priceOffered: 22,
            description: 'รับซื้อมะเขือเทศสด เกรด A ขนาดปานกลาง',
            expiryDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
            status: DemandStatus.OPEN,
        },
    });

    const buyRequest4 = await prisma.buyRequest.create({
        data: {
            buyerId: buyer2.id,
            productId: products[9].id, // กะหล่ำปลี
            quantityRequired: 300,
            description: 'รับซื้อกะหล่ำปลี ขนาดใหญ่ ไม่มีตำหนิ',
            expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: DemandStatus.OPEN,
        },
    });

    console.log(`✅ Created 4 buy requests`);

    // Create Cultivations
    console.log('🌱 Creating cultivations...');
    const cultivation1 = await prisma.cultivation.create({
        data: {
            farmId: farm1.id,
            productId: products[0].id, // ข้าวหอมมะลิ
            startDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
            expectedHarvestDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
            estimatedYield: 500,
            status: CultivationStatus.GROWING,
        },
    });

    const cultivation2 = await prisma.cultivation.create({
        data: {
            farmId: farm2.id,
            productId: products[2].id, // ข้าวโพด
            startDate: new Date(today.getTime() - 80 * 24 * 60 * 60 * 1000),
            expectedHarvestDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            estimatedYield: 750,
            status: CultivationStatus.GROWING,
        },
    });

    const cultivation3 = await prisma.cultivation.create({
        data: {
            farmId: farm3.id,
            productId: products[7].id, // มะเขือเทศ
            startDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
            expectedHarvestDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            estimatedYield: 200,
            status: CultivationStatus.GROWING,
        },
    });

    const cultivation4 = await prisma.cultivation.create({
        data: {
            farmId: farm4.id,
            productId: products[0].id, // ข้าวหอมมะลิ
            startDate: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000),
            expectedHarvestDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            estimatedYield: 1200,
            status: CultivationStatus.HARVESTED,
        },
    });

    console.log(`✅ Created 4 cultivations`);

    // Create Contracts
    console.log('📄 Creating contracts...');
    await prisma.contract.create({
        data: {
            cultivationId: cultivation4.id,
            buyRequestId: buyRequest1.id,
            farmerId: farmer3.id,
            buyerId: buyer1.id,
            agreedPrice: 16200,
            agreedQuantity: 1000,
            status: ContractStatus.SIGNED,
            signedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
    });

    console.log(`✅ Created 1 contract`);

    // Create Promotions
    console.log('🎉 Creating promotions...');
    const promotion1 = await prisma.promotion.create({
        data: {
            name: 'ส่วนลดพิเศษข้าวหอมมะลิ',
            description: 'รับส่วนลดพิเศษเมื่อซื้อข้าวหอมมะลิตั้งแต่ 1,000 กก. ขึ้นไป',
            type: PromotionType.PERCENTAGE_DISCOUNT,
            discountValue: 5,
            minPurchase: 16000,
            startDate: new Date(),
            endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: PromotionStatus.ACTIVE,
            targetProducts: [products[0].id, products[1].id],
            isPublic: true,
            usageLimit: 100,
        },
    });

    const promotion2 = await prisma.promotion.create({
        data: {
            name: 'โปรโมชั่นฤดูเก็บเกี่ยว',
            description: 'ส่วนลดพิเศษสำหรับผู้ซื้อรายใหญ่ในช่วงฤดูเก็บเกี่ยว',
            type: PromotionType.FIXED_DISCOUNT,
            discountValue: 500,
            minPurchase: 50000,
            maxDiscount: 5000,
            startDate: new Date(),
            endDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
            status: PromotionStatus.ACTIVE,
            targetProducts: [products[0].id, products[2].id, products[4].id],
            isPublic: true,
        },
    });

    console.log(`✅ Created 2 promotions`);

    // Create Promo Codes
    console.log('🏷️ Creating promo codes...');
    await prisma.promoCode.createMany({
        data: [
            {
                code: 'RICE2024',
                promotionId: promotion1.id,
                isActive: true,
                usageLimit: 50,
                validFrom: new Date(),
                validUntil: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
            {
                code: 'HARVEST50',
                promotionId: promotion2.id,
                isActive: true,
                usageLimit: 20,
                validFrom: new Date(),
                validUntil: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
            },
            {
                code: 'NEWBUYER',
                promotionId: promotion1.id,
                isActive: true,
                usageLimit: 100,
            },
        ],
    });

    console.log(`✅ Created 3 promo codes`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - 6 Users (1 Admin, 3 Farmers, 2 Buyers)');
    console.log('   - 16 Products (10 Crops, 3 Livestock, 3 Aquatic)');
    console.log('   - 4 Farms');
    console.log(`   - ${marketPriceData.length} Market Price records`);
    console.log('   - 4 Buy Requests');
    console.log('   - 4 Cultivations');
    console.log('   - 1 Contract');
    console.log('   - 2 Promotions');
    console.log('   - 3 Promo Codes');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', JSON.stringify(e, null, 2));
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
