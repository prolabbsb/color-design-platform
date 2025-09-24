-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CONTRACT', 'INVOICE', 'RECEIPT', 'QUOTE_PDF', 'OTHER');

-- CreateTable
CREATE TABLE "public"."cd_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cd_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_product_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_product_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cd_documents" ADD CONSTRAINT "cd_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."cd_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_product_images" ADD CONSTRAINT "cd_product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_product_assets" ADD CONSTRAINT "cd_product_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
