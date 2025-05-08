-- DropForeignKey
ALTER TABLE "ProductDuplicate" DROP CONSTRAINT "ProductDuplicate_duplicateProductId_fkey";

-- DropForeignKey
ALTER TABLE "ProductDuplicate" DROP CONSTRAINT "ProductDuplicate_masterProductId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_shopId_fkey";

-- DropForeignKey
ALTER TABLE "variant" DROP CONSTRAINT "variant_productId_fkey";

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDuplicate" ADD CONSTRAINT "ProductDuplicate_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDuplicate" ADD CONSTRAINT "ProductDuplicate_duplicateProductId_fkey" FOREIGN KEY ("duplicateProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant" ADD CONSTRAINT "variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
