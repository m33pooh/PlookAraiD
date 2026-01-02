-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FARMER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "WaterSource" AS ENUM ('IRRIGATION', 'GROUNDWATER', 'RAIN');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('CROP', 'LIVESTOCK', 'AQUATIC');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('OPEN', 'CLOSED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "CultivationStatus" AS ENUM ('PLANNING', 'GROWING', 'HARVESTED', 'SOLD');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SIGNED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FARMER',
    "phoneNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "address" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationLat" DECIMAL(10,8) NOT NULL,
    "locationLng" DECIMAL(11,8) NOT NULL,
    "areaSize" DECIMAL(10,2) NOT NULL,
    "soilType" TEXT,
    "waterSource" "WaterSource" NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "growthDurationDays" INTEGER NOT NULL,
    "suitableMonths" JSONB,
    "baseCostPerRai" DECIMAL(10,2),
    "imageUrl" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_prices" (
    "id" BIGSERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sourceName" TEXT NOT NULL,
    "priceMin" DECIMAL(10,2) NOT NULL,
    "priceMax" DECIMAL(10,2) NOT NULL,
    "dateRecorded" DATE NOT NULL,

    CONSTRAINT "market_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buy_requests" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantityRequired" DECIMAL(12,2) NOT NULL,
    "priceOffered" DECIMAL(10,2),
    "description" TEXT,
    "expiryDate" DATE NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buy_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivations" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "expectedHarvestDate" DATE NOT NULL,
    "estimatedYield" DECIMAL(12,2),
    "status" "CultivationStatus" NOT NULL DEFAULT 'PLANNING',

    CONSTRAINT "cultivations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "cultivationId" TEXT NOT NULL,
    "buyRequestId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "agreedPrice" DECIMAL(10,2) NOT NULL,
    "agreedQuantity" DECIMAL(12,2) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "farms_locationLat_locationLng_idx" ON "farms"("locationLat", "locationLng");

-- CreateIndex
CREATE INDEX "market_prices_productId_dateRecorded_idx" ON "market_prices"("productId", "dateRecorded");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_cultivationId_key" ON "contracts"("cultivationId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_prices" ADD CONSTRAINT "market_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buy_requests" ADD CONSTRAINT "buy_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buy_requests" ADD CONSTRAINT "buy_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivations" ADD CONSTRAINT "cultivations_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivations" ADD CONSTRAINT "cultivations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_cultivationId_fkey" FOREIGN KEY ("cultivationId") REFERENCES "cultivations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_buyRequestId_fkey" FOREIGN KEY ("buyRequestId") REFERENCES "buy_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
