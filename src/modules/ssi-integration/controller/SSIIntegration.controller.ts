import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { BackendGuard } from "src/shared/guards/backend.guard";
import { Assessment } from "src/shared/interface/assessment.interface";
import { CareerWalletOperationTypeModel } from "../model/CareerWallet.model";
import { SessionAttestModel, SessionVerifyModel } from "../model/RabobankApi.model";

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

  @Post('create-ssi')
  async createSSI(@Body() assessment: Assessment) {
    const toAttest: SessionAttestModel = {
      Assessment: {
        predicates: assessment
      }
    }
    const request = await this.rabobankApiService.createSession(toAttest);
    const payload = this.careerWalletService.generateQRPayload(request.data.qrcode, CareerWalletOperationTypeModel.issuing);
    const QRCodeUrl = await this.qrCodeService.generateQRCodeURL(payload);
    return { qrcode: QRCodeUrl, transactionId: request.data.transactionId, sessionId: request.data.sessionId };
  }

  @Post('verify-ssi')
  async verifySSI(@Body() assessment: Assessment) {
    const toVerify = this.rabobankApiService.createVerifyObject(assessment);
    const request = await this.rabobankApiService.verifySession(toVerify);
    const payload = this.careerWalletService.generateQRPayload(request.data.qrcode, CareerWalletOperationTypeModel.verification);
    const QRCodeUrl = await this.qrCodeService.generateQRCodeURL(payload);
    return { qrcode: QRCodeUrl, transactionId: request.data.transactionId, sessionId: request.data.sessionId };
  }
}