import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from 'src/app.module'; // Import your main application module
import * as fs from 'fs'; // Import the 'fs' module for file system operations
import { VersioningType } from '@nestjs/common';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
    app.enableVersioning({
    type: VersioningType.URI,
  });

   // ✅ Enable CORS -  THIS IS IMPORTANT, so that the script can access the server!
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });


  const config = new DocumentBuilder()
    .setTitle('Courier Management System API')
    .setDescription('The Courier Management System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Write to JSON file
  fs.writeFileSync("./swagger-spec.json", JSON.stringify(document, null, 2));
  console.log("Swagger specification generated in swagger-spec.json");
  await app.close();
}
generateSwagger();