import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ArrowDownRight, ArrowRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface RankedStock {
  id: number;
  name: string;
  price: number;
  change: number;
  rank: number;
}

interface TopStockProps {
  rankedStocks: RankedStock[];
}

const TopStock = ({ rankedStocks }: TopStockProps) => {
  return (
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
        <Link
          to="/investment/stocks"
          className="mt-4 flex items-center justify-center sm:justify-end text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span>Xem thêm</span>
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default TopStock;
