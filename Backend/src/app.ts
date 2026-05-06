//importar o fastify e as rotas
import Fastify from "fastify";
//infortar o fastifay instance
import type { FastifyInstance } from "fastify";
import routes from "./Routes";
import { env } from "./config/env";
import cors from '@fastify/cors'


const app: FastifyInstance = Fastify({
    logger: {
        level: env.NODE_ENV === 'dev' ? 'info': 'error',
    },
});

app.register(cors, {
    origin: true, // Permitir todas as origens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP permitidos
})


//registrar as rotas no servidor com o prefixo '/api'
app.register(routes, {prefix: '/api'});

//prefix: 'api' é usado para definir um prefixo para todas as rotas registradas
//localhgost:3000/api/categories

export default app;