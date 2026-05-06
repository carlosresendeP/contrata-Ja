import type { FastifyInstance } from "fastify";
import { JobController } from "@/controllers/JobController";
import { createJobSchema } from "@/schemas/job.schema";

import type { CreateJobDTO, UpdateJobDTO } from "../schemas/job.schema";
import { validateSchema } from "@/middleware/validade.schema";
import { authMiddleware } from "@/middleware/auth.middleware";

export async function jobRoutes(app: FastifyInstance) {
  const jobController = new JobController();

  app.addHook("preHandler", authMiddleware);

  app.post<{ Body: CreateJobDTO }>(
    "/",
    {
      preHandler: [validateSchema(createJobSchema)],
    },
    jobController.create
  );

  app.get("/", jobController.list);
  app.get("/:id", jobController.getById);
  app.patch<{ Body: UpdateJobDTO, Params: { id: string } }>("/:id", jobController.update);
}