import { HttpService, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { Assessment } from "src/shared/interface/assessment.interface";

import { IssueTransactionStatusResponseModel, SessionAttestModel, SessionResponseModel, SessionVerifyModel, VerifyTransactionStatusResponseModel } from "../model/RabobankApi.model";

@Injectable()
export class RapbobankApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  createSession(toAttestIssue: SessionAttestModel): Promise<AxiosResponse<SessionResponseModel>> {
    return this.httpService.post<SessionResponseModel>('/sessions', { toAttest: toAttestIssue, toVerify: [], userId: 'workpi' }).toPromise();
  }

  getIssueStatus(transactionId: string): Promise<AxiosResponse<IssueTransactionStatusResponseModel[]>> {
    return this.httpService.get<IssueTransactionStatusResponseModel[]>(`/transactions/${transactionId}`).toPromise();
  }

  verifySession(toVerifyIssue: SessionVerifyModel[]): Promise<AxiosResponse<SessionResponseModel>> {
    return this.httpService.post<SessionResponseModel>('/sessions', { toAttest: {}, toVerify: toVerifyIssue, userId: 'workpi' }).toPromise();
  }

  getVerificationStatus(transactionId: string): Promise<AxiosResponse<VerifyTransactionStatusResponseModel>> {
    return this.httpService.get<VerifyTransactionStatusResponseModel>(`/verification-status/${transactionId}`).toPromise();
  }

  createVerifyObject(assessment: Assessment): SessionVerifyModel[] {
    return Object.keys(assessment)
      .filter((key: keyof Assessment) => key !== 'groupingKey')
      .reduce((acc, key) => ([...acc, {
        '@context': [assessment.groupingKey],
        predicate: key,
        correlationGroup: "1",
        allowedIssuers: [this.configService.get('RABOBANK_DID_ISSUER')]
      } as SessionVerifyModel]), [])
  }

  createAttestObject(assessment: Assessment): SessionAttestModel {
    const { name, groupingKey, providerName, completedDate, type, measurements } = assessment;

    return {
      [groupingKey]: {
        predicates: {
          name, providerName, completedDate, type, measurements
        }
      }
    }
  }
}