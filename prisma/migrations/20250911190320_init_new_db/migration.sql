-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ARCHITECT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."IndicationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'CONCLUDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "public"."cd_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ARCHITECT',
    "referralCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cd_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_indications" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "status" "public"."IndicationStatus" NOT NULL DEFAULT 'PENDING',
    "projectValue" DECIMAL(65,30),
    "architectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cd_indications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cd_commissions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "indicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "cd_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cd_users_email_key" ON "public"."cd_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cd_users_referralCode_key" ON "public"."cd_users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "cd_commissions_indicationId_key" ON "public"."cd_commissions"("indicationId");

-- AddForeignKey
ALTER TABLE "public"."cd_indications" ADD CONSTRAINT "cd_indications_architectId_fkey" FOREIGN KEY ("architectId") REFERENCES "public"."cd_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_commissions" ADD CONSTRAINT "cd_commissions_indicationId_fkey" FOREIGN KEY ("indicationId") REFERENCES "public"."cd_indications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
