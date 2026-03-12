import { v1Api } from "../axios";

export interface ExchangeRateItem {
  currency_code: string;
  currency_name: string;
  "buy _cash": string;
  "buy _transfer": string;
  sell: string;
  date: string;
}

export interface ExchangeRateMeta {
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_pages: number;
  total_count: number;
}

export interface GetExchangeRatesResponse {
  data: ExchangeRateItem[];
  meta: ExchangeRateMeta;
}

export const exchangeRateV1Service = {
  async getExchangeRates(
    date: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<GetExchangeRatesResponse> {
    const response = await v1Api.get("/exchange_rates/vcb", {
      params: { date, page, per_page: perPage },
    });
    return response.data;
  },
};
