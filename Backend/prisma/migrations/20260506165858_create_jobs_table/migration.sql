-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ABERTA', 'FECHADA', 'PAUSADA');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "requisitos" TEXT,
    "salario" DECIMAL(10,2),
    "status" "JobStatus" NOT NULL DEFAULT 'ABERTA',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
