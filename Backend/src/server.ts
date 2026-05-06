import app from "./app";
import { prismaConnect } from "@/config/prisma";



const startServer = async () => {
  try {
    await prismaConnect();
    // await inializeGlobalCategories();


    await app.listen({
      port: Number(process.env.PORT) || 3001,
      host: "0.0.0.0",
    });

    console.log(
      `🚀 Servidor rodando na porta ${process.env.PORT || 3001}`
    );
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();