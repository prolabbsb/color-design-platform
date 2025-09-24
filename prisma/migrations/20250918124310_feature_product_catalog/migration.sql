/*
  Warnings:

  - Added the required column `catalogItemId` to the `cd_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cd_products" ADD COLUMN     "catalogItemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."cd_product_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "basePrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cd_product_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cd_product_catalog_name_key" ON "public"."cd_product_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cd_product_catalog_sku_key" ON "public"."cd_product_catalog"("sku");

-- AddForeignKey
ALTER TABLE "public"."cd_products" ADD CONSTRAINT "cd_products_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
