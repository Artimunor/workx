
export enum CareerWalletOperationTypeModel { issuing = 'issuing', verification = 'verification' };

export class CareerWalletInviteModel {
  inviteURL: string;
  operationType: CareerWalletOperationTypeModel;
  documentName?: string;
}