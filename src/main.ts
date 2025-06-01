import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({// Allow requests from your Next.js app
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Use environment variable or default to localhost
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies & authentication headers
  });

  const config = new DocumentBuilder()
    .setTitle('Courier Management System API')
    .setDescription('The Courier Management System API description')
    .setVersion('1.0')
    //.addTag('couriers') // You can add tags to group endpoints
    .addBearerAuth() // If you're using JWT auth
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
