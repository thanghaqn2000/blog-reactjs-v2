import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { database } from "@/lib/firebase";
import { TopStockItem, topStockV1Service } from "@/services/v1/top_stock_v1.service";
import { ref as dbRef, onValue } from "firebase/database";
import { ArrowRight, Crown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TopStock = () => {
  const [stocks, setStocks] = useState<TopStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        setLoading(true);
        const res = await topStockV1Service.getTopStocks(5);
        setStocks(res.data ?? []);
      } catch (error) {
        console.error("Failed to fetch top stocks", error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStocks();

    const lastUpdatedRef = dbRef(database, "charts/last_updated_at");
    let isFirstSnapshot = true;
    const unsubscribe = onValue(lastUpdatedRef, (snapshot) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }
      const updatedValue = snapshot.val();
      if (updatedValue) {
        fetchTopStocks();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
              <TableHead>Mã</TableHead>
              <TableHead className="text-right">Sức mạnh</TableHead>
              <TableHead className="text-right">Khối lượng TB 20 ngày</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu cổ phiếu.
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.rank}</TableCell>
                  <TableCell>{stock.symbol}</TableCell>
                  <TableCell className="text-right">{stock.rs_value}</TableCell>
                  <TableCell className="text-right">{stock.vol_20d}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Link
          to="/stock-insight"
          className="mt-4 flex items-center justify-center sm:justify-end text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span className="flex items-center gap-1">
            Xem thêm
            <Crown size={16} className="text-amber-500" />
          </span>
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default TopStock;

