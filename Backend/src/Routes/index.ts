//rotas
import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { jobRoutes } from "./job.routes";



async function routes(fastify: FastifyInstance): Promise<void> {

    fastify.get('/health', async () => {
        return { status: 'ok',
            message: 'Servidor está ativo e funcionando corretamente!'
        };
    })


    fastify.register(authRoutes)
    fastify.register(jobRoutes, {prefix: '/jobs'})
}

export default routes;