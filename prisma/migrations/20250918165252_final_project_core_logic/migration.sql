/*
  Warnings:

  - You are about to drop the `cd_pieces` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cd_product_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cd_product_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."cd_pieces" DROP CONSTRAINT "cd_pieces_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cd_product_assets" DROP CONSTRAINT "cd_product_assets_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cd_product_images" DROP CONSTRAINT "cd_product_images_productId_fkey";

-- DropTable
DROP TABLE "public"."cd_pieces";

-- DropTable
DROP TABLE "public"."cd_product_assets";

-- DropTable
DROP TABLE "public"."cd_product_images";

-- CreateTable
CREATE TABLE "public"."cd_catalog_pieces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Peça',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "height" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "depth" DECIMAL(65,30) NOT NULL,
    "catalogItemId" TEXT NOT NULL,

    CONSTRAINT "cd_catalog_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_catalog_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "catalogItemId" TEXT NOT NULL,

    CONSTRAINT "cd_catalog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_catalog_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,

    CONSTRAINT "cd_catalog_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_project_pieces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Peça',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "height" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "depth" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_project_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_project_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_project_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_project_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cd_catalog_pieces" ADD CONSTRAINT "cd_catalog_pieces_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_catalog_images" ADD CONSTRAINT "cd_catalog_images_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_catalog_assets" ADD CONSTRAINT "cd_catalog_assets_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_project_pieces" ADD CONSTRAINT "cd_project_pieces_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_project_images" ADD CONSTRAINT "cd_project_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_project_assets" ADD CONSTRAINT "cd_project_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
