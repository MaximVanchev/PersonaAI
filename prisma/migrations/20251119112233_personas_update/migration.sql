/*
  Warnings:

  - Added the required column `gender` to the `Persona` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Persona" ADD COLUMN     "gender" TEXT NOT NULL;
