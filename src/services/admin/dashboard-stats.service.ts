import { adminApi } from '../axios';

export interface DashboardChartPoint {
  date: string;
  home_views: number;
}

export interface DashboardStatsNormalized {
  total_users: number;
  new_users_this_week: number;
  new_users_growth_percent: number | null;
  top_stocks_views_today: number;
  conversion_rate_percent: number;
  chart_data: DashboardChartPoint[];
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function numFrom(obj: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function parseConversionRate(obj: Record<string, unknown>): number {
  const v = obj.conversion_rate ?? obj.conversionRate;
  if (typeof v !== 'number' && typeof v !== 'string') return 0;
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return 0;
  if (n > 0 && n <= 1) return n * 100;
  return Math.min(100, Math.max(0, n));
}

function parseGrowthPercent(root: Record<string, unknown>): number | null {
  const direct =
    root.new_users_week_over_week_percent ??
    root.new_users_growth_percent ??
    root.new_users_week_growth_percent;
  if (typeof direct === 'number' && !Number.isNaN(direct)) return direct;
  if (typeof direct === 'string') {
    const n = Number(direct);
    if (!Number.isNaN(n)) return n;
  }

  const thisW = numFrom(root, ['new_users_this_week', 'new_users_week']);
  const prevW = numFrom(root, ['new_users_last_week', 'new_users_previous_week']);
  if (prevW === 0 && thisW === 0) return null;
  if (prevW === 0) return 100;
  return ((thisW - prevW) / prevW) * 100;
}

function normalizeChart(raw: unknown): DashboardChartPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const r = asRecord(row);
      if (!r) return null;
      const date = String(r.date ?? r.day ?? r.label ?? '');
      const home_views = numFrom(r, [
        'home_views',
        'views',
        'count',
        'home_view_count',
        'value',
      ]);
      if (!date) return null;
      return { date, home_views };
    })
    .filter((x): x is DashboardChartPoint => x !== null);
}

export function normalizeDashboardStats(raw: unknown): DashboardStatsNormalized {
  const unwrap = asRecord(raw);
  const root = unwrap?.data !== undefined ? asRecord(unwrap.data) : unwrap;
  if (!root) {
    return {
      total_users: 0,
      new_users_this_week: 0,
      new_users_growth_percent: null,
      top_stocks_views_today: 0,
      conversion_rate_percent: 0,
      chart_data: [],
    };
  }

  const topPerf = asRecord(root.top_stocks_performance ?? root.topStocksPerformance);

  const top_stocks_views_today = topPerf
    ? numFrom(topPerf, ['views', 'view_count', 'today_views'])
    : numFrom(root, [
        'top_stocks_views_today',
        'top_stock_views_today',
        'stock_insight_views_today',
      ]);

  const conversion_rate_percent = topPerf
    ? parseConversionRate(topPerf)
    : parseConversionRate(root);

  return {
    total_users: numFrom(root, ['total_users', 'totalUsers', 'users_count']),
    new_users_this_week: numFrom(root, [
      'new_users_this_week',
      'new_users_week',
      'weekly_new_users',
    ]),
    new_users_growth_percent: parseGrowthPercent(root),
    top_stocks_views_today,
    conversion_rate_percent,
    chart_data: normalizeChart(root.chart_data ?? root.chartData),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStatsNormalized> {
  const { data } = await adminApi.get<unknown>('/dashboard_stats');
  return normalizeDashboardStats(data);
}

export function isDashboardStatsEmpty(s: DashboardStatsNormalized): boolean {
  if (
    s.total_users > 0 ||
    s.top_stocks_views_today > 0 ||
    s.new_users_this_week > 0 ||
    s.conversion_rate_percent > 0
  ) {
    return false;
  }
  return s.chart_data.length === 0;
}
