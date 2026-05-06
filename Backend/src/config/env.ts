import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envShema = z.object({
    PORT: z.string().transform(Number).default(3001),
    // DATABASE_URL: z.string().min(5, "DATABASE_URL é obrigatório"),
    NODE_ENV: z.enum(["dev", "test", "prod"], {
        message: "o Node Env deve ser ,dev, test, ou prod"
    }),
    JWT_SECRET: z.string().min(10, "Secret Key required"),
});

const _env = envShema.safeParse(process.env) //safeparse é usado para validar o objeto de ambiente

if (!_env.success) {
    console.error("Invalid environment variables!");
    process.exit(1);  // Encerra o processo com erro
}

export const env = _env.data;