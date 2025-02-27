-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "since_id" TEXT,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "shopId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "parentType" TEXT,
    "childType" TEXT,
    "tags" TEXT,
    "image" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "on_sale_variant_id" TEXT,
    "cheapestPrice" DOUBLE PRECISION,
    "suspectedDuplicateOfId" TEXT,
    "approvedDuplicate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT,
    "option1" TEXT,
    "option2" TEXT,
    "option3" TEXT,
    "sku" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "shoeSize" DOUBLE PRECISION,
    "deckSize" DOUBLE PRECISION,
    "compareAtPrice" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,
    "taxable" BOOLEAN,
    "featuredImage" TEXT,
    "available" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorRule" (
    "id" TEXT NOT NULL,
    "vendorPattern" TEXT NOT NULL,
    "standardVendor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_name_key" ON "shop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shop_url_key" ON "shop"("url");

-- CreateIndex
CREATE INDEX "product_shopId_idx" ON "product"("shopId");

-- CreateIndex
CREATE INDEX "product_title_idx" ON "product"("title");

-- CreateIndex
CREATE INDEX "product_cheapestPrice_idx" ON "product"("cheapestPrice");

-- CreateIndex
CREATE INDEX "product_parentType_idx" ON "product"("parentType");

-- CreateIndex
CREATE INDEX "product_childType_idx" ON "product"("childType");

-- CreateIndex
CREATE INDEX "product_createdAt_idx" ON "product"("createdAt");

-- CreateIndex
CREATE INDEX "product_updatedAt_idx" ON "product"("updatedAt");

-- CreateIndex
CREATE INDEX "variant_productId_idx" ON "variant"("productId");

-- CreateIndex
CREATE INDEX "variant_price_idx" ON "variant"("price");

-- CreateIndex
CREATE INDEX "variant_productId_price_idx" ON "variant"("productId", "price");

-- CreateIndex
CREATE INDEX "variant_shoeSize_idx" ON "variant"("shoeSize");

-- CreateIndex
CREATE INDEX "variant_deckSize_idx" ON "variant"("deckSize");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_suspectedDuplicateOfId_fkey" FOREIGN KEY ("suspectedDuplicateOfId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant" ADD CONSTRAINT "variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
