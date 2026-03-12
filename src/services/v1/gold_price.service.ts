import { v1Api } from "../axios";

export interface GoldPriceItem {
  name: string;
  buy_price: number;
  sell_price: number;
  world_price: number;
  time: string;
}

export interface GoldPriceMeta {
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_pages: number;
  total_count: number;
}

export interface GetGoldPricesResponse {
  data: GoldPriceItem[];
  meta: GoldPriceMeta;
}

export const goldPriceV1Service = {
  async getGoldPrices(page: number = 1, perPage: number = 10): Promise<GetGoldPricesResponse> {
    const response = await v1Api.get("/gold_prices/btmc", {
      params: { page, per_page: perPage },
    });
    return response.data;
  },
};
