-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDENTE', 'EM_ANALISE', 'TESTE_PSICOMETRICO', 'ENTREVISTA', 'APROVADO', 'REPROVADO');

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "curriculoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDENTE',
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "jobs_companyId_titulo_status_idx" ON "jobs"("companyId", "titulo", "status");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
