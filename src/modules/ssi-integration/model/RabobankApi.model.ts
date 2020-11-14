export interface SessionVerifyModel {
  '@context': string[];
  predicate: any;
  correlationGroup?: string;
  allowedIssuers: string[]
}

export interface SessionAttestModel {
  [context: string]: { predicates: { [key: string]: any } }
}

export interface SessionDocumentModel {
  toAttest: SessionAttestModel;
  toVerify: SessionVerifyModel[];
  userId: string;
}

export interface SessionResponseModel {
  sessionId: string;
  qrcode: string;
  transactionId: string;
}

export enum TransactionStatusModel { CONFIRMED = 'CONFIRMED' }

export interface IssueTransactionStatusResponseModel {
  id: string;
  userId: string;
  predicates: string[];
  status: TransactionStatusModel;
}

export interface VerifyTransactionStatusResponseModel {
  id: string;
  did: string;
  issuer: string;
  predicateValues: { [key: string]: any };
  status: TransactionStatusModel;
}

