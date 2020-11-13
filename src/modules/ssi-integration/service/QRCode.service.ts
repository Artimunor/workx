import { HttpService, Injectable } from "@nestjs/common";
import { toDataURL } from 'qrcode';

@Injectable()
export class QRCodeService {
  constructor(private httpService: HttpService) { }

  async generateQRCodeURL<T>(payload: T): Promise<string> {
    return toDataURL(JSON.stringify(payload));
  }
}