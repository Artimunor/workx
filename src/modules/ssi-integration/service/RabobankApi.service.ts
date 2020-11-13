import { HttpService, Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";

import { IssueTransactionStatusResponseModel, SessionDocumentModel, SessionResponseModel, VerifyTransactionStatusResponseModel } from "../model/RabobankApi.model";

@Injectable()
export class RapbobankApiService {
  constructor(private httpService: HttpService) { }

  createSession(issueDocument: SessionDocumentModel): Promise<AxiosResponse<SessionResponseModel>> {
    return this.httpService.post<SessionResponseModel>('/sessions', issueDocument).toPromise();
  }

  getIssueStatus(transactionId: string): Promise<AxiosResponse<IssueTransactionStatusResponseModel[]>> {
    return this.httpService.get<IssueTransactionStatusResponseModel[]>(`/transactions/${transactionId}`).toPromise();
  }

  verifySession(verifyDocument: SessionDocumentModel): Promise<AxiosResponse<SessionResponseModel>> {
    return this.httpService.post<SessionResponseModel>('/sessions', verifyDocument).toPromise();
  }

  getVerificationStatus(transactionId: string): Promise<AxiosResponse<VerifyTransactionStatusResponseModel>> {
    return this.httpService.get<VerifyTransactionStatusResponseModel>(`/verification-status/${transactionId}`).toPromise();
  }
}