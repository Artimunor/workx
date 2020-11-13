import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from 'express';
import { BackendGuard } from "src/shared/guards/backend.guard";

import { CareerWalletService } from "../service/CareerWallet.service";
import { QRCodeService } from "../service/QRCode.service";
import { RapbobankApiService } from "../service/RabobankApi.service";

@UseGuards(BackendGuard)
@Controller('integration')
export class SSIIntegrationController {
  constructor(
    private readonly qrCodeService: QRCodeService,
    private rabobankApiService: RapbobankApiService,
    private careerWalletService: CareerWalletService,
  ) { }

  @Get('qr')
  async getQR(@Req() req: Request, @Res() res: Response) {
    const sub = await this.rabobankApiService.createSession({
      toAttest: {
        ID: {
          predicates: {
            name: 'darius'
          }
        }
      },
      toVerify: [],
      userId: 'uuid123'
    });

    const payload = this.careerWalletService.generateQRPayload(sub.data.qrcode);

    const QRCodeurl = await this.qrCodeService.generateQRCodeURL(payload)

    return res.send(QRCodeurl);
  }
}