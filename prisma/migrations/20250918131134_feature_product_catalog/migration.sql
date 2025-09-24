/*
  Warnings:

  - You are about to drop the column `productId` on the `cd_pieces` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `cd_product_assets` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `cd_product_images` table. All the data in the column will be lost.
  - Added the required column `catalogItemId` to the `cd_pieces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogItemId` to the `cd_product_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogItemId` to the `cd_product_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cd_pieces" DROP CONSTRAINT "cd_pieces_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cd_product_assets" DROP CONSTRAINT "cd_product_assets_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cd_product_images" DROP CONSTRAINT "cd_product_images_productId_fkey";

-- AlterTable
ALTER TABLE "public"."cd_pieces" DROP COLUMN "productId",
ADD COLUMN     "catalogItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."cd_product_assets" DROP COLUMN "productId",
ADD COLUMN     "catalogItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."cd_product_images" DROP COLUMN "productId",
ADD COLUMN     "catalogItemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."cd_pieces" ADD CONSTRAINT "cd_pieces_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_product_images" ADD CONSTRAINT "cd_product_images_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_product_assets" ADD CONSTRAINT "cd_product_assets_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
