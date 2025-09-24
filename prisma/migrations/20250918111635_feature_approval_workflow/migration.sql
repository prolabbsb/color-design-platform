/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `cd_offices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."cd_offices" ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "public"."cd_users" ADD COLUMN     "agreedToTermsAt" TIMESTAMP(3),
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "status" "public"."AccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL';

-- CreateIndex
CREATE UNIQUE INDEX "cd_offices_cnpj_key" ON "public"."cd_offices"("cnpj");
