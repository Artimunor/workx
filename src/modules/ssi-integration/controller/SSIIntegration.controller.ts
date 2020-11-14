import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { BackendGuard } from "src/shared/guards/backend.guard";
import { Assessment } from "src/shared/interface/assessment.interface";
import { SessionAttestModel } from "../model/RabobankApi.model";

import { CareerWalletService } from "../service/CareerWallet.service";
import { QRCodeService } from "../service/QRCode.service";
import { RapbobankApiService } from "../service/RabobankApi.service";

@UseGuards(BackendGuard)
@Controller('integration')
export class SSIIntegrationController {
  constructor(
    private readonly qrCodeService: QRCodeService,
    private readonly rabobankApiService: RapbobankApiService,
    private readonly careerWalletService: CareerWalletService,
  ) { }

  @Post('create-session')
  async createSession(@Body() assessment: Assessment) {
    const toAttest: SessionAttestModel = {
      Assessment: {
        predicates: assessment
      }
    }
    const sub = await this.rabobankApiService.createSession(toAttest);
    const payload = this.careerWalletService.generateQRPayload(sub.data.qrcode);
    const QRCodeUrl = await this.qrCodeService.generateQRCodeURL(payload);
    return { qrcode: QRCodeUrl, transactionId: sub.data.transactionId, sessionId: sub.data.sessionId };
  }
}