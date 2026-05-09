import type { FastifyRequest, FastifyReply } from "fastify"
import { UploadService } from "@/services/UploadService"

const uploadService = new UploadService()

export class UploadController {
  async upload(req: FastifyRequest, reply: FastifyReply) {
    const file = await req.file()
    const result = await uploadService.processUpload(file)
    
    return reply.status(201).send({ ok: true, data: result })
  }

  async serveFile(req: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) {
    const { filename } = req.params
    const { stream, safeFilename, contentType } = uploadService.getFileStream(filename)

    reply.header("Content-Type", contentType)
    reply.header("Content-Disposition", `inline; filename="${safeFilename}"`)
    
    return reply.send(stream)
  }
}