import { createServer } from "http";
import { createApp } from "./app";
import { config } from "./config/env";
import { logger } from "./lib/logger";
import { createSocketServer } from "./socket";
import { disconnectPrisma } from "./lib/prisma";

async function bootstrap() {
  const app = createApp();
  const httpServer = createServer(app);
  const io = createSocketServer(httpServer);

  const port = config.port;

  httpServer.listen(port, () => {
    logger.info(`🚀 Fuse server listening on port ${port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);
    io.close();
    httpServer.close(async () => {
      await disconnectPrisma();
      logger.info("Server gracefully stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
