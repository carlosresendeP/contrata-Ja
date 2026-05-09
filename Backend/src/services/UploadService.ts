import path from "path"
import fs from "fs"
import { randomUUID } from "crypto"
import { AppError } from "@/config/error"

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png":       ".png",
  "image/jpeg":      ".jpg",
  "image/webp":      ".webp",
  "image/svg+xml":   ".svg",
}

const REVERSE_TYPES: Record<string, string> = {
  ".pdf":  "application/pdf",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
}

export class UploadService {
  async processUpload(file: any) { // Se usar typescript com fastify-multipart, troque 'any' por 'MultipartFile'
    if (!file) throw new AppError("Nenhum arquivo enviado.", 400)

    const ext = ALLOWED_TYPES[file.mimetype]
    if (!ext) throw new AppError("Tipo não suportado. Envie PDF, PNG, JPG, WebP ou SVG.", 400)

    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const filename = `${randomUUID()}${ext}`
    const buffer = await file.toBuffer()
    fs.writeFileSync(path.join(uploadsDir, filename), buffer)

    const baseUrl = process.env.BASE_URL ?? "http://localhost:3001"
    return { url: `${baseUrl}/api/public/uploads/${filename}` }
  }

  getFileStream(filename: string) {
    const safeFilename = path.basename(filename) // Previne path traversal
    const filePath = path.join(process.cwd(), "uploads", safeFilename)

    if (!fs.existsSync(filePath)) throw new AppError("Arquivo não encontrado.", 404)

    const ext = path.extname(safeFilename).toLowerCase()
    const contentType = REVERSE_TYPES[ext] || "application/octet-stream"
    const stream = fs.createReadStream(filePath)

    return { stream, safeFilename, contentType }
  }
}