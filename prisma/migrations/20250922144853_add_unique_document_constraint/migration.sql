/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `cd_documents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cd_documents_userId_type_key" ON "public"."cd_documents"("userId", "type");
