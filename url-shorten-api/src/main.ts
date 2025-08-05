import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create(AppModule);
  const port = Number(PORT || '5000');

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('URL Shortener')
    .setDescription('URL shortening system')
    .setVersion('2.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  app.listen(port).then(() => {
    logger.log(`Listening on port ${port}`);
  });
}

bootstrap();