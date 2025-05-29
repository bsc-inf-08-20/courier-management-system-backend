import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({// Allow requests from your Next.js app
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002', // Use environment variable or default to localhost
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Specify allowed methods
    credentials: true, // Allow cookies & authentication headers
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
