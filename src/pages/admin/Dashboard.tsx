import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import { fetchDashboardStats, isDashboardStatsEmpty } from '@/services/admin/dashboard-stats.service';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, FileText, Loader2, RefreshCw, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminLayout from '../../layouts/AdminLayout';

const lineChartConfig = {
  home_views: {
    label: 'Lượt xem',
    theme: {
      light: 'hsl(var(--primary))',
      dark: 'hsl(var(--primary))',
    },
  },
} satisfies ChartConfig;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function formatInt(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n));
}

function formatPercentChange(n: number | null): { text: string; trend: 'up' | 'down' | 'flat' } {
  if (n === null || Number.isNaN(n)) return { text: '—', trend: 'flat' };
  if (n > 0) return { text: `+${n.toFixed(1)}%`, trend: 'up' };
  if (n < 0) return { text: `${n.toFixed(1)}%`, trend: 'down' };
  return { text: '0%', trend: 'flat' };
}

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

const Dashboard = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard_stats'],
    queryFn: fetchDashboardStats,
  });

  const stats = data;
  const lineData =
    stats?.chart_data.map((row) => ({
      label: formatShortDate(row.date),
      home_views: row.home_views,
    })) ?? [];

  const growth = formatPercentChange(stats?.new_users_growth_percent ?? null);
  const showGlobalEmpty = !isLoading && !error && stats && isDashboardStatsEmpty(stats);

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trang quản trị</h1>
            <p className="text-muted-foreground">
              Tổng quan thống kê và nội dung — làm mới dữ liệu không cần tải lại trang.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isFetching || isLoading}
              onClick={() => void refetch()}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Làm mới dữ liệu
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Xem trang chủ</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/posts/create">
                <FileText className="mr-2 h-4 w-4" />
                Tạo bài viết mới
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-destructive">Không tải được thống kê</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Lỗi không xác định. Thử làm mới sau.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {showGlobalEmpty && (
          <p className="text-center text-sm text-muted-foreground rounded-md border border-dashed py-6">
            Không có dữ liệu
          </p>
        )}

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && stats && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Tổng số người dùng"
                value={formatInt(stats.total_users)}
                icon={Users}
                footer={<span className="text-muted-foreground">Tất cả tài khoản</span>}
              />
              <StatCard
                title="User mới trong tuần"
                value={formatInt(stats.new_users_this_week)}
                icon={FileText}
                footer={
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      growth.trend === 'up'
                        ? 'text-green-600'
                        : growth.trend === 'down'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <span className="font-medium">{growth.text}</span>
                    <span>so với tuần trước</span>
                  </p>
                }
              />
              <StatCard
                title="Lượt xem Top cổ phiếu (hôm nay)"
                value={formatInt(stats.top_stocks_views_today)}
                icon={BarChart3}
                footer={<span className="text-muted-foreground">Trang Stock Insight</span>}
              />
              <ConversionCard ratePercent={stats.conversion_rate_percent} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lượt xem trang chủ — 7 ngày gần nhất</CardTitle>
                <CardDescription>Biến động lượt truy cập theo ngày</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-16">Không có dữ liệu</p>
                ) : (
                  <ChartContainer config={lineChartConfig} className="h-80 w-full">
                    <LineChart data={lineData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8 }}
                        labelFormatter={(lbl) => String(lbl)}
                      />
                      <Line
                        type="monotone"
                        dataKey="home_views"
                        name="Lượt xem"
                        stroke="var(--color-home_views)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  footer,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  footer: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1">{footer}</div>
    </CardContent>
  </Card>
);

const ConversionCard = ({ ratePercent }: { ratePercent: number }) => {
  const r = Math.min(100, Math.max(0, ratePercent));
  const pieData =
    r <= 0
      ? [{ name: 'empty', value: 100 }]
      : [
          { name: 'chuyển đổi', value: r },
          { name: 'khác', value: 100 - r },
        ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-36 w-full flex justify-center [&_.recharts-wrapper]:outline-none">
          <PieChart width={200} height={140}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={62}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              nameKey="name"
            >
              {pieData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={
                    r <= 0
                      ? PIE_COLORS[1]
                      : PIE_COLORS[i % PIE_COLORS.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)}%`,
                name,
              ]}
            />
          </PieChart>
        </div>
        <div className="text-2xl font-bold tabular-nums">{r.toFixed(2)}%</div>
        <p className="text-xs text-muted-foreground mt-1">Tỷ lệ chuyển đổi ghi nhận</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
