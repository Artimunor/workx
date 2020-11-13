import { ConfigService } from "@nestjs/config";
import { AxiosRequestConfig } from "axios";

export const createHttpModuleSSIApi = async (configService: ConfigService): Promise<AxiosRequestConfig> => ({
  baseURL: configService.get('RABOBANK_URL'),
  headers: {
    authorization: `Basic ${configService.get('RABOBANK_TOKEN')}`
  }
});