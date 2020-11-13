import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisModule } from './modules/redis/redis.module';
import { GraphqlConfigService } from './config/graphql.config';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmConfigService } from './config/typeorm.config';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { MailerConfigService } from './config/mailer.config';
import { AuthController } from './modules/auth/controller/auth.controller';
import { MulterConfigService } from './config/multer.config';
import { AvatarController } from './modules/auth/controller/avatar.controller';
import { DataLoaderInterceptor } from './shared/dataloader/dataloader';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    RedisModule,
    AuthModule,
  ],
  controllers: [AuthController, AvatarController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class AppModule {}
