/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; 
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );
  
  app.enableCors({
    origin: '*', 
  });

  const config = new DocumentBuilder()
    .setTitle('Edvana API')
    .setDescription('The API docs for Edvana platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ✅ CHANGE THIS LINE - Bind to 0.0.0.0
  await app.listen(process.env.PORT || 12142, '0.0.0.0');
}
bootstrap();