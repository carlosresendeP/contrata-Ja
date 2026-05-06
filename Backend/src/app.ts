// importar o fastify e as rotas
import Fastify from "fastify";
// importar o fastify instance
import type { FastifyInstance } from "fastify";
import routes from "./Routes/index"; // -> Só ajustei o caminho para bater com a pasta que criamos
import { env } from "./config/env";
import cors from '@fastify/cors';

// NOVIDADES: Importações do Zod e de Erros
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { AppError } from "./config/error";

const app: FastifyInstance = Fastify({
    logger: {
        level: env.NODE_ENV === 'dev' ? 'info': 'error',
    },
});

app.register(cors, {
    origin: true, // Permitir todas as origens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP permitidos
});

// Ensina o Fastify a usar o Zod nativamente nas rotas[cite: 2]
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Tratamento Global de Erros: Segurança máxima para não vazar dados[cite: 2]
app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ ok: false, error: error.message });
    }

    if (error instanceof ZodError) {
        return reply.status(400).send({ ok: false, error: "Dados inválidos", fieldErrors: error.flatten().fieldErrors });
    }

    request.log.error(error);
    return reply.status(500).send({ ok: false, error: "Erro interno do servidor" });
});

// registrar as rotas no servidor com o prefixo '/api'
app.register(routes, { prefix: '/api' });

export default app;