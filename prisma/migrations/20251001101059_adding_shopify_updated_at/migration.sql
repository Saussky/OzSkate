-- DropIndex
DROP INDEX "product_updatedAt_idx";

-- CreateIndex
CREATE INDEX "product_shopifyUpdatedAt_idx" ON "product"("shopifyUpdatedAt");
