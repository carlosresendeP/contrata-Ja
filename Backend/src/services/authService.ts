import bcrypt from "bcryptjs";
import { prisma } from "@/config/prisma"; 
import { AppError } from "@/config/error";
import type { RegisterDTO, LoginDTO } from "../schemas/auth.schema";
import  jwt  from "jsonwebtoken";
import { env } from "../config/env";

export class AuthService {
  async register({ nome, email, password, razaoSocial, cnpj }: RegisterDTO) {
    // 1. Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // 2. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Transação: Cria Empresa + Usuário
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { razaoSocial, cnpj },
      });

      const user = await tx.user.create({
        data: { 
          nome, 
          email, 
          password: hashedPassword, 
          companyId: company.id 
        },
      });

      return { company, user };
    });

    return result;
  }

  // Método para Login  --------------------------
  async login({ email, password }: LoginDTO) {
    // 1. Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError("Email or password incorrect", 401);
    }

    // 2. Valida a senha (Comparação segura)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Email or password incorrect", 401);
    }

    // 3. Busca os dados da empresa relacionados a este usuário
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, razaoSocial: true, cnpj: true }, // Seleciona só o que precisa
    });

    if (!company) {
      // Isso aqui é só por segurança extra, teoricamente não deveria acontecer
      throw new AppError("Company data not found.", 500);
    }

    // 4. GERA O TOKEN
    const payload = { 
      sub: user.id, 
      companyId: user.companyId, 
      role: user.role 
    };
    
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
      company, // Retorna os dados da empresa também
    };
  }


  // Método para buscar o próprio usuário --------------------------
  async getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: {
          nome: true,
          onboardingStep: true,
          logoUrl: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  return user;
}
}