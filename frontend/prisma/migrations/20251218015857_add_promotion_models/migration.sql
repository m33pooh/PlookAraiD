-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'FREE_SHIPPING', 'BUNDLE_DEAL');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "discountValue" DECIMAL(10,2),
    "minPurchase" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "targetProducts" INTEGER[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
