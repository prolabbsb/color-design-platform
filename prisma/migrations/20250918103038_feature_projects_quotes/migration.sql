/*
  Warnings:

  - You are about to drop the column `clientEmail` on the `cd_indications` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `cd_indications` table. All the data in the column will be lost.
  - You are about to drop the column `clientPhone` on the `cd_indications` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `cd_indications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISED');

-- AlterTable
ALTER TABLE "public"."cd_indications" DROP COLUMN "clientEmail",
DROP COLUMN "clientName",
DROP COLUMN "clientPhone",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."cd_users" ADD COLUMN     "officeId" TEXT;

-- CreateTable
CREATE TABLE "public"."cd_offices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cd_offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cd_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Brasil',
    "clientId" TEXT NOT NULL,

    CONSTRAINT "cd_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "indicationId" TEXT NOT NULL,

    CONSTRAINT "cd_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_pieces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Peça',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "height" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "depth" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "cd_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_quotes" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),
    "indicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cd_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cd_clients_email_key" ON "public"."cd_clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cd_clients_document_key" ON "public"."cd_clients"("document");

-- AddForeignKey
ALTER TABLE "public"."cd_users" ADD CONSTRAINT "cd_users_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "public"."cd_offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_indications" ADD CONSTRAINT "cd_indications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."cd_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_addresses" ADD CONSTRAINT "cd_addresses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."cd_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_products" ADD CONSTRAINT "cd_products_indicationId_fkey" FOREIGN KEY ("indicationId") REFERENCES "public"."cd_indications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_pieces" ADD CONSTRAINT "cd_pieces_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."cd_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_quotes" ADD CONSTRAINT "cd_quotes_indicationId_fkey" FOREIGN KEY ("indicationId") REFERENCES "public"."cd_indications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
