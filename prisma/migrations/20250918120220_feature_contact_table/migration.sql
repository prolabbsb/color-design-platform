/*
  Warnings:

  - You are about to drop the column `email` on the `cd_clients` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `cd_clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cau]` on the table `cd_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('EMAIL_MAIN', 'EMAIL_SECONDARY', 'PHONE_MAIN', 'PHONE_WHATSAPP', 'INSTAGRAM', 'OTHER');

-- DropIndex
DROP INDEX "public"."cd_clients_email_key";

-- AlterTable
ALTER TABLE "public"."cd_clients" DROP COLUMN "email",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "public"."cd_users" ADD COLUMN     "cau" TEXT;

-- CreateTable
CREATE TABLE "public"."cd_contact_methods" (
    "id" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "notes" TEXT,
    "clientId" TEXT,
    "officeId" TEXT,

    CONSTRAINT "cd_contact_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cd_users_cau_key" ON "public"."cd_users"("cau");

-- AddForeignKey
ALTER TABLE "public"."cd_contact_methods" ADD CONSTRAINT "cd_contact_methods_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."cd_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_contact_methods" ADD CONSTRAINT "cd_contact_methods_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "public"."cd_offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
