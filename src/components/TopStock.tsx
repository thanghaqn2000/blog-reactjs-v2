import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/lib/firebase";
import { TopStockItem, topStockV1Service } from "@/services/v1/top_stock.service";
import { ref as dbRef, onValue } from "firebase/database";
import { ArrowRight, Crown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VipUpgradeModal from "./VipUpgradeModal";

const formatVol = (val: number | string): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
  return String(num);
};

const TopStock = () => {
  const [stocks, setStocks] = useState<TopStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const canViewVip = !!user && (user.is_admin || user.is_vip);
  const shouldGateVip = !canViewVip;

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
        {shouldGateVip && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
              <Crown size={24} />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-base font-bold text-amber-900 sm:text-lg">
                Bảng xếp hạng này dành cho user VIP
              </p>
              <p className="text-sm leading-relaxed text-amber-800 sm:text-[15px]">
                Vui lòng nâng cấp tài khoản để xem đầy đủ và chi tiết dữ liệu sức mạnh cổ phiếu.
              </p>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full rounded-full bg-amber-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-700 active:scale-[0.98] sm:w-auto sm:py-2.5"
              >
                Nâng cấp VIP ngay
              </button>
            </div>
          </div>
        )}

        <div className={shouldGateVip ? "relative opacity-40 blur-sm pointer-events-none" : ""}>
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
                  <TableCell className="text-right">{formatVol(stock.vol_20d)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
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
      <VipUpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

    </Card>
  );
};

export default TopStock;

