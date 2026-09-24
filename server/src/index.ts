import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main() {
  await connectDB();
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`Shop Swift API listening on port ${env.PORT} (${env.NODE_ENV})`);
    if (env.ENABLE_SWAGGER) {
      logger.info(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
    }
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
