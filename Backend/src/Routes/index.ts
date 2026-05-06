//rotas
import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { jobRoutes } from "./job.routes";
import { applicationRoutes } from "./application.routes";



async function routes(fastify: FastifyInstance): Promise<void> {

    fastify.get('/health', async () => {
        return { status: 'ok',
            message: 'Servidor está ativo e funcionando corretamente!'
        };
    })


    fastify.register(authRoutes)
    fastify.register(jobRoutes, {prefix: '/jobs'})
    fastify.register(applicationRoutes, {prefix: '/applications'})
}

export default routes;