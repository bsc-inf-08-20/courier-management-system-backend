import { config } from 'dotenv';
config(); // Loads environment variables
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({// Allow requests from your Next.js app
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Use environment variable or default to localhost
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Specify allowed methods
    credentials: true, // Allow cookies & authentication headers
  });

   // Swagger configuration
   const config = new DocumentBuilder()
   .setTitle('Your API Title') // Set the title of your API documentation
   .setDescription('API description') // Set the description
   .setVersion('1.0') // Set the version
   .addTag('users') // Optional: Add tags to group routes
   .build();

 const document = SwaggerModule.createDocument(app, config);

 // Enable Swagger at the /api/docs endpoint
 SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();