🗄️ Database Setup with Prisma ORMเอกสารนี้แสดงขั้นตอนการติดตั้งและตั้งค่า Prisma เพื่อเชื่อมต่อกับฐานข้อมูล (PostgreSQL) สำหรับโปรเจกต์ "ปลูกอะไรดี" โดยอิงตาม ER Diagram ที่ออกแบบไว้📦 1. Installationติดตั้ง Prisma และ Prisma Client ลงในโปรเจกต์ Next.js# ติดตั้ง Prisma CLI เป็น dev dependency
npm install prisma --save-dev

# ติดตั้ง Prisma Client
npm install @prisma/client

# เริ่มต้น Prisma (สร้างโฟลเดอร์ prisma)
npx prisma init
🛠️ 2. Prisma Schema (prisma/schema.prisma)ก๊อปปี้โค้ดด้านล่างไปใส่ในไฟล์ prisma/schema.prisma โค้ดนี้แปลงมาจาก ER Diagram ของเราครับgenerator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // หรือ "mysql" ตามที่เลือกใช้
  url      = env("DATABASE_URL")
}

// --- Enums (ตัวเลือกแบบคงที่) ---
enum Role {
  FARMER
  BUYER
  ADMIN
}

enum WaterSource {
  IRRIGATION
  GROUNDWATER
  RAIN
}

enum ProductCategory {
  CROP
  LIVESTOCK
  AQUATIC
}

enum DemandStatus {
  OPEN
  CLOSED
  FULFILLED
}

enum CultivationStatus {
  PLANNING
  GROWING
  HARVESTED
  SOLD
}

enum ContractStatus {
  DRAFT
  SIGNED
  COMPLETED
  CANCELLED
}

// --- Models (ตารางข้อมูล) ---

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  passwordHash  String
  role          Role      @default(FARMER)
  phoneNumber   String?
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  profile       UserProfile?
  farms         Farm[]          // เฉพาะ Farmer
  buyRequests   BuyRequest[]    // เฉพาะ Buyer
  contractsAsFarmer Contract[]  @relation("FarmerContracts")
  contractsAsBuyer  Contract[]  @relation("BuyerContracts")

  @@map("users")
}

model UserProfile {
  id        String  @id @default(cuid())
  userId    String  @unique
  fullName  String?
  address   String? @db.Text
  bio       String? @db.Text
  avatarUrl String?

  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model Farm {
  id          String      @id @default(cuid())
  farmerId    String
  name        String
  locationLat Decimal     @db.Decimal(10, 8)
  locationLng Decimal     @db.Decimal(11, 8)
  areaSize    Decimal     @db.Decimal(10, 2) // หน่วย: ไร่
  soilType    String?
  waterSource WaterSource

  // Relations
  farmer       User          @relation(fields: [farmerId], references: [id])
  cultivations Cultivation[]

  @@index([locationLat, locationLng]) // Index สำหรับค้นหาพิกัด
  @@map("farms")
}

model Product {
  id                 Int      @id @default(autoincrement())
  name               String
  category           ProductCategory
  growthDurationDays Int
  suitableMonths     Json?    // เก็บเป็น Array [1, 5, 9]
  baseCostPerRai     Decimal? @db.Decimal(10, 2)
  imageUrl           String?

  // Relations
  marketPrices marketPrice[]
  buyRequests  BuyRequest[]
  cultivations Cultivation[]

  @@map("products")
}

model marketPrice {
  id           BigInt   @id @default(autoincrement())
  productId    Int
  sourceName   String
  priceMin     Decimal  @db.Decimal(10, 2)
  priceMax     Decimal  @db.Decimal(10, 2)
  dateRecorded DateTime @db.Date

  product      Product  @relation(fields: [productId], references: [id])

  @@index([productId, dateRecorded]) // Index สำหรับดึงกราฟราคา
  @@map("market_prices")
}

model BuyRequest {
  id               String       @id @default(cuid())
  buyerId          String
  productId        Int
  quantityRequired Decimal      @db.Decimal(12, 2)
  priceOffered     Decimal?     @db.Decimal(10, 2)
  description      String?      @db.Text
  expiryDate       DateTime     @db.Date
  status           DemandStatus @default(OPEN)
  createdAt        DateTime     @default(now())

  // Relations
  buyer     User       @relation(fields: [buyerId], references: [id])
  product   Product    @relation(fields: [productId], references: [id])
  contracts Contract[]

  @@map("buy_requests")
}

model Cultivation {
  id                  String            @id @default(cuid())
  farmId              String
  productId           Int
  startDate           DateTime          @db.Date
  expectedHarvestDate DateTime          @db.Date
  estimatedYield      Decimal?          @db.Decimal(12, 2)
  status              CultivationStatus @default(PLANNING)

  // Relations
  farm     Farm      @relation(fields: [farmId], references: [id])
  product  Product   @relation(fields: [productId], references: [id])
  contract Contract?

  @@map("cultivations")
}

model Contract {
  id             String         @id @default(cuid())
  cultivationId  String         @unique
  buyRequestId   String
  farmerId       String
  buyerId        String
  agreedPrice    Decimal        @db.Decimal(10, 2)
  agreedQuantity Decimal        @db.Decimal(12, 2)
  status         ContractStatus @default(DRAFT)
  signedAt       DateTime?

  // Relations
  cultivation Cultivation @relation(fields: [cultivationId], references: [id])
  buyRequest  BuyRequest  @relation(fields: [buyRequestId], references: [id])
  farmer      User        @relation("FarmerContracts", fields: [farmerId], references: [id])
  buyer       User        @relation("BuyerContracts", fields: [buyerId], references: [id])

  @@map("contracts")
}
🔌 3. Prisma Client Instance (src/lib/db.ts)สร้างไฟล์นี้เพื่อให้ Next.js เรียกใช้ Prisma Client เพียงตัวเดียว (Singleton Pattern) ป้องกันการเปิด Connection มากเกินไปในโหมด Developmentimport { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // แสดง Query ใน Console เพื่อ Debug
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
🚀 4. Usage Stepsหลังจากสร้างไฟล์เสร็จแล้ว ให้รันคำสั่งต่อไปนี้:ตั้งค่า .env:แก้ไขไฟล์ .env ใส่ Connection String ของ Database คุณDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
Push Schema:สร้างตารางใน Database จริงnpx prisma db push
Generate Client:อัปเดต Type Definitions ให้ตรงกับ Schemanpx prisma generate
ตอนนี้คุณสามารถเรียกใช้ Database ใน Next.js ได้แล้วครับ ตัวอย่าง:import { db } from '@/lib/db';

// ตัวอย่าง: ดึงข้อมูลพืชทั้งหมด
const crops = await db.product.findMany({
  where: { category: 'CROP' }
});
