-- CreateEnum
CREATE TYPE "public"."ArchitectOfficeRole" AS ENUM ('MANAGER', 'COLLABORATOR');

-- AlterTable
ALTER TABLE "public"."cd_commissions" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."cd_users" ADD COLUMN     "architectRole" "public"."ArchitectOfficeRole";
