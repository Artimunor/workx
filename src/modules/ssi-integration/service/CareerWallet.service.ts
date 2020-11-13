import { HttpService, Injectable } from "@nestjs/common";

import { CareerWalletInviteModel, CareerWalletOperationTypeModel } from "../model/CareerWallet.model";

@Injectable()
export class CareerWalletService {
  constructor(private httpService: HttpService) { }

  generateQRPayload(url, operationType: CareerWalletOperationTypeModel = CareerWalletOperationTypeModel.issuing): CareerWalletInviteModel {
    return {
      inviteURL: url,
      operationType,
      documentName: 'workpiSSIIntegrationTest'
    }
  }
}