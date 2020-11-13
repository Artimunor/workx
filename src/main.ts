import * as helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  //app.use(helmet());

  // const corsOrigin = configService.get<string>('CORS_ORIGIN');
  // const corsOriginList = [corsOrigin];

  // const corsLocalHost = configService.get<string>('CORS_LOCALHOST');
  // if (corsLocalHost && corsLocalHost != '') {
  //   corsOriginList.push(corsLocalHost);
  // }

  // app.enableCors({
  //   origin: corsOriginList,
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
    }),
  );

  await app.listen(4000);

  Logger.log(`Server is running on: ${await app.getUrl()}`, 'main');
}

bootstrap();
