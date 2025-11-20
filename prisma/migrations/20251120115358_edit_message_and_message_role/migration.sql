/*
  Warnings:

  - You are about to drop the column `sender` on the `Message` table. All the data in the column will be lost.
  - Added the required column `role` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('system', 'user', 'assistant');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "sender",
ADD COLUMN     "role" "MessageRole" NOT NULL;

-- DropEnum
DROP TYPE "public"."MessageType";
