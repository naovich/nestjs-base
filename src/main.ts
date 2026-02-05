import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
