-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('PRODUCT_ADDED', 'PRODUCT_DELETED', 'PRICE_CHANGED', 'VARIANT_ADDED', 'VARIANT_DELETED', 'VARIANT_UPDATED', 'SALE_STATUS_CHANGED');

-- CreateTable
CREATE TABLE "ProductUpdateLog" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER,
    "shopName" TEXT,
    "productId" TEXT,
    "productTitle" TEXT,
    "variantId" TEXT,
    "variantTitle" TEXT,
    "changeType" "UpdateType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductUpdateLog_createdAt_idx" ON "ProductUpdateLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductUpdateLog" ADD CONSTRAINT "ProductUpdateLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUpdateLog" ADD CONSTRAINT "ProductUpdateLog_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUpdateLog" ADD CONSTRAINT "ProductUpdateLog_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
