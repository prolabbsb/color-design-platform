-- DropForeignKey
ALTER TABLE "public"."cd_products" DROP CONSTRAINT "cd_products_catalogItemId_fkey";

-- AlterTable
ALTER TABLE "public"."cd_indications" ADD COLUMN     "requestedCommissionPercentage" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."cd_products" ALTER COLUMN "catalogItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."cd_products" ADD CONSTRAINT "cd_products_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."cd_product_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
