import axios from "axios"

const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"

const publicApi = axios.create({ baseURL: base })

export interface PublicJob {
  id: string
  titulo: string
  descricao: string | null
  jdGerada: string | null
  requisitos: string | null
  salaryMin: string | null
  salaryMax: string | null
  status: string
  company: {
    nome: string | null
    razaoSocial: string
    logoUrl: string | null
  }
}

export const publicService = {
  getJob: async (publicToken: string): Promise<PublicJob> => {
    const { data } = await publicApi.get(`/public/jobs/${publicToken}`)
    return data.data
  },

  uploadResume: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await publicApi.post("/public/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data.data.url as string
  },

  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await publicApi.post("/public/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data.data.url as string
  },

  apply: async (body: {
    jobId: string
    nome: string
    email: string
    telefone?: string
    curriculoUrl?: string
  }) => {
    const { data } = await publicApi.post("/applications/apply", body)
    return data.data
  },
}
