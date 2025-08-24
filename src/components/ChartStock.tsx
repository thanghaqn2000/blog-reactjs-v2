import {
  ref as dbRef,
  onValue
} from "firebase/database";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { postService, type ChartStock as ChartStockData } from "@/services/admin/post.service";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { database } from "@/lib/firebase";

interface ChartStockProps {
  className?: string;
}

const ChartStock = ({ className = "" }: ChartStockProps) => {
  const [chartData, setChartData] = useState<ChartStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const response = await postService.getChartStock();
      setChartData(response.data);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();

    const lastUpdatedRef = dbRef(database, "charts/last_updated_at");
    const unsubscribe = onValue(lastUpdatedRef, (snapshot) => {
      const updatedValue = snapshot.val();
      if (updatedValue) {
        console.log("Realtime update:", updatedValue);
        fetchChartData();
      }
    });

    return () => unsubscribe();
  }, []);

  const transformedData = chartData.map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          HIỆU SUẤT ĐẦU TƯ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <ChartContainer
            className="h-[240px]"
            config={{
              price: {
                theme: {
                  light: "#8B5CF6",
                  dark: "#9b87f5",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transformedData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartStockData;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="text-sm font-bold">{data.name}</div>
                          <div className="text-sm text-muted-foreground">Rank #{data.rank}</div>
                          <div className="text-sm font-medium text-primary">
                            ${parseFloat(data.price).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="price" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartStock;
