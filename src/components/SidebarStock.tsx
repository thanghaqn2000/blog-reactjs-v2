import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Types
interface RankedStock {
  id: number;
  name: string;
  price: number;
  change: number;
  rank: number;
}

interface FundGrowthData {
  day: string;
  value: number;
}

interface SidebarStockProps {
  rankedStocks: RankedStock[];
  fundGrowthData: FundGrowthData[];
  className?: string;
}

const SidebarStock = ({ rankedStocks, fundGrowthData, className = "" }: SidebarStockProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Ranked stocks table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            TOP CỔ PHIẾU MẠNH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-right">Biến động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.rank}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(stock.change).toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Fund growth chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            HIỆU SUẤT ĐẦU TƯ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[240px]"
            config={{
              value: {
                theme: {
                  light: "#8B5CF6",
                  dark: "#9b87f5"
                }
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={fundGrowthData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="text-sm font-bold">{payload[0].payload.day}</div>
                          <div className="text-sm font-medium text-primary">
                            ${typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#8B5CF6"
                  dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidebarStock; 
