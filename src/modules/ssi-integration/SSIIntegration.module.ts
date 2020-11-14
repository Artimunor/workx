import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SSIIntegrationController } from './controller/SSIIntegration.controller';
import { createHttpModuleSSIApi } from './factory/Rabobank.factory';
import { CareerWalletService } from './service/CareerWallet.service';
import { QRCodeService } from './service/QRCode.service';
import { RapbobankApiService } from './service/RabobankApi.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createHttpModuleSSIApi,
      inject: [ConfigService]
    })
  ],
  controllers: [SSIIntegrationController],
  providers: [
    RapbobankApiService,
    QRCodeService,
    CareerWalletService,
    SSIIntegrationController
  ],
  exports: [RapbobankApiService],
})
export class SSIIntegrationModule { }
