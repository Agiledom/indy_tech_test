import logger from "./framework/logger";
import buildServer from "./server";
import dotenv from "dotenv";

dotenv.config({
  path: [".env.local", ".env"],
});

const server = buildServer();

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.info(`Server listening at ${address}`);
});
