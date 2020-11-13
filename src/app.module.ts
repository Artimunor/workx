import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { APP_GUARD } from '@nestjs/core';
import { SSIIntegrationModule } from './modules/ssi-integration/SSIIntegration.module';
import { BackendGuard } from './shared/guards/backend.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SSIIntegrationModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: BackendGuard,
    },
  ],
})
export class AppModule { }
