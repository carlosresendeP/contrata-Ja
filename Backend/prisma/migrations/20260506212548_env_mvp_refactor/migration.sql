/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "contextoEmpresa" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "nome" TEXT,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "perfilRitmo" TEXT,
ADD COLUMN     "valores" TEXT[];

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "feedbackIA" TEXT,
ADD COLUMN     "matchScore" INTEGER;

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "respostasJson" JSONB,
ADD COLUMN     "testCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "jdGerada" TEXT,
ADD COLUMN     "liderId" TEXT,
ADD COLUMN     "perfilIdealJson" JSONB,
ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "salaryMax" DECIMAL(10,2),
ADD COLUMN     "salaryMin" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "organograma_nodes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "parentId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organograma_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_results" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "disc" TEXT,
    "eneagrama" TEXT,
    "rawScore" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personality_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personality_results_candidateId_key" ON "personality_results"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "test_links_token_key" ON "test_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_publicToken_key" ON "jobs"("publicToken");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organograma_nodes" ADD CONSTRAINT "organograma_nodes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_results" ADD CONSTRAINT "personality_results_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
