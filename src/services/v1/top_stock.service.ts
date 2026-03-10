import { v1Api } from "../axios";

export interface TopStockItem {
  id: number;
  rank: number;
  symbol: string;
  rs_value: string;
  vol_20d: string;
}

export interface GetTopStocksResponse {
  data: TopStockItem[];
}

export interface StockInsightData {
  id: number;
  date: string;
  advancing: number;
  declining: number;
  index_pct: string;
  pct_above_ma50: string;
  pct_above_ma100: string;
  pct_above_ma200: string;
  vnindex_close: string;
  vnindex_ma200: string;
  signal_ma200: string;
  signal_breadth: string;
  signal_ma50: string;
  market_regime: string;
  regime_desc: string;
}

export interface GetStockInsightResponse {
  data: StockInsightData;
}

export const topStockV1Service = {
  async getTopStocks(perPage: number = 5): Promise<GetTopStocksResponse> {
    const response = await v1Api.get("/top_stocks", {
      params: { per_page: perPage },
      withCredentials: true,
    });
    return response.data;
  },

  async getStockInsight(): Promise<GetStockInsightResponse> {
    const response = await v1Api.get("/top_stocks/stock_insights", {
      withCredentials: true,
    });
    return response.data;
  },
};

