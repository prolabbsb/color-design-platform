-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('PENDING_VALIDATION', 'ACTIVE', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."UsageRights" AS ENUM ('INTERNAL_USE_ONLY', 'PORTFOLIO', 'MARKETING');

-- AlterTable
ALTER TABLE "public"."cd_commissions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."cd_documents" ADD COLUMN     "status" "public"."FileStatus" DEFAULT 'PENDING_VALIDATION',
ADD COLUMN     "uploadedById" TEXT,
ADD COLUMN     "usageRights" "public"."UsageRights" DEFAULT 'INTERNAL_USE_ONLY';

-- AlterTable
ALTER TABLE "public"."cd_project_assets" ADD COLUMN     "status" "public"."FileStatus" DEFAULT 'PENDING_VALIDATION',
ADD COLUMN     "uploadedById" TEXT,
ADD COLUMN     "usageRights" "public"."UsageRights" DEFAULT 'INTERNAL_USE_ONLY';

-- AlterTable
ALTER TABLE "public"."cd_project_images" ADD COLUMN     "status" "public"."FileStatus" DEFAULT 'PENDING_VALIDATION',
ADD COLUMN     "uploadedById" TEXT,
ADD COLUMN     "usageRights" "public"."UsageRights" DEFAULT 'INTERNAL_USE_ONLY';

-- AddForeignKey
ALTER TABLE "public"."cd_project_images" ADD CONSTRAINT "cd_project_images_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."cd_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_project_assets" ADD CONSTRAINT "cd_project_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."cd_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cd_documents" ADD CONSTRAINT "cd_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."cd_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
