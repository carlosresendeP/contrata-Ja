import type { FastifyInstance } from "fastify"
import { PublicJobController } from "@/controllers/PublicJobController"
import { UploadController } from "@/controllers/UploadController"

const publicJobController = new PublicJobController()
const uploadController = new UploadController()

export async function publicJobRoutes(app: FastifyInstance) {
  // GET /api/public/jobs/:publicToken — sem autenticação
  app.get<{ Params: { publicToken: string } }>(
    "/:publicToken",
    (req, reply) => publicJobController.getJob(req, reply)
  )
}

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/public/upload — upload de arquivo (PDF ou imagem)
  app.post(
    "/upload", 
    (req, reply) => uploadController.upload(req, reply)
  )

  // GET /api/public/uploads/:filename — serve o PDF/Imagem
  app.get<{ Params: { filename: string } }>(
    "/uploads/:filename", 
    (req, reply) => uploadController.serveFile(req, reply)
  )
}