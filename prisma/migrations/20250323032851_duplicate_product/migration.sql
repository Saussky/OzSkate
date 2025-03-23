/*
  Warnings:

  - You are about to drop the column `approvedDuplicate` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `suspectedDuplicateOfId` on the `product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DuplicateStatus" AS ENUM ('suspected', 'confirmed', 'rejected');

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_suspectedDuplicateOfId_fkey";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "approvedDuplicate",
DROP COLUMN "suspectedDuplicateOfId";

-- CreateTable
CREATE TABLE "ProductDuplicate" (
    "id" TEXT NOT NULL,
    "masterProductId" TEXT NOT NULL,
    "duplicateProductId" TEXT NOT NULL,
    "status" "DuplicateStatus" NOT NULL DEFAULT 'suspected',
    "reasons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDuplicate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductDuplicate_masterProductId_duplicateProductId_key" ON "ProductDuplicate"("masterProductId", "duplicateProductId");

-- AddForeignKey
ALTER TABLE "ProductDuplicate" ADD CONSTRAINT "ProductDuplicate_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDuplicate" ADD CONSTRAINT "ProductDuplicate_duplicateProductId_fkey" FOREIGN KEY ("duplicateProductId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
