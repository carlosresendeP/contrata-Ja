//rotas
import type { FastifyInstance } from "fastify";



async function routes(fastify: FastifyInstance): Promise<void> {

    fastify.get('/health', async () => {
        return { status: 'ok',
            message: 'Servidor está ativo e funcionando corretamente!'
        };
    })


    // fastify.register(categoryRoutes, {prefix: '/categories'})
    // fastify.register(transitionRoutes, {prefix: '/transactions'})
}

export default routes;