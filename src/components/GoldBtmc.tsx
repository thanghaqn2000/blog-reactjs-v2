import { GoldPriceItem, goldPriceV1Service } from '@/services/v1/gold_price.service';
import { ChevronLeft, ChevronRight, Clock, Loader2, Search, Shield } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 10;

const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ/chỉ';

function GoldBtmc() {
  const [data, setData] = useState<GoldPriceItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clock, setClock] = useState('');

  const fetchData = useCallback(async (p: number) => {
    try {
      setLoading(true);
      const res = await goldPriceV1Service.getGoldPrices(p, ITEMS_PER_PAGE);
      setData(res.data);
      setTotalPages(res.meta.total_pages);
      setTotalCount(res.meta.total_count);
    } catch (error) {
      console.error('Failed to fetch gold prices', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('vi-VN')} — ${now.toLocaleTimeString('vi-VN')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => item.name.toLowerCase().includes(term));
  }, [data, searchTerm]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex flex-col text-stone-800">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/95 backdrop-blur-md z-10 shrink-0">
        <div className="max-w-[1550px] mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-lg sm:text-[25px] font-bold tracking-tighter text-stone-800 italic uppercase leading-none">
                ORCA<span className="text-amber-600">GOLD</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded border border-stone-100 shadow-inner">
                <span className="text-[12px] font-black text-stone-500 uppercase tracking-widest leading-none">
                  Cập Nhật Real-time
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="sm:hidden w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="flex items-center shadow-sm border border-stone-200 rounded-sm overflow-hidden">
                <svg width="28" height="18" viewBox="0 0 30 20">
                  <rect width="30" height="20" fill="#DA251D" />
                  <polygon
                    points="15,4 16.17,8.82 21.17,8.82 17.13,11.8 18.3,16.62 15,13.64 11.7,16.62 12.87,11.8 8.83,8.82 13.83,8.82"
                    fill="#FFFF00"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-[1550px] mx-auto px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col min-h-0 w-full">
        {/* Header & Search */}
        <div className="mb-3 sm:mb-4 flex flex-col gap-3 sm:gap-4 bg-white p-3 sm:p-3.5 rounded-2xl border border-stone-100 shadow-sm shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-[21px] font-black text-stone-900 tracking-tight leading-none">
                Thị Trường Vàng
              </h1>
              <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mt-1.5 leading-none">
                Nguồn: BẢO TÍN MINH CHÂU
              </p>
            </div>
            <div className="h-9 w-px bg-stone-100 hidden md:block" />
            <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-100 flex items-center gap-3 shadow-inner">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-stone-700 text-sm sm:text-[16px] font-mono font-bold leading-none">
                {clock || '--/--/---- — --:--:--'}
              </span>
            </div>
          </div>
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh..."
              className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 outline-none transition-all w-full shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[1.25rem] border border-stone-200 shadow-md overflow-hidden flex flex-col">
          <div className="overflow-auto max-h-[calc(100vh-320px)]" style={{ scrollbarWidth: 'thin' }}>
            <table className="w-full text-left min-w-[700px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr className="text-stone-500 text-[12px] font-black uppercase tracking-wider">
                  <th className="px-4 sm:px-5 py-3 sm:py-4 w-[30%] border-r border-stone-200/60 sticky top-0 z-30 bg-stone-100/[0.98] backdrop-blur-sm shadow-[inset_0_-1px_0_rgba(231,229,228,1)]">
                    Sản phẩm
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 w-[20%] border-r border-stone-200/60 sticky top-0 z-30 bg-stone-100/[0.98] backdrop-blur-sm shadow-[inset_0_-1px_0_rgba(231,229,228,1)]">
                    Mua vào
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 w-[20%] border-r border-stone-200/60 sticky top-0 z-30 bg-stone-100/[0.98] backdrop-blur-sm text-emerald-800 shadow-[inset_0_-1px_0_rgba(231,229,228,1)]">
                    Bán ra
                  </th>
                  <th className="px-4 sm:px-5 py-3 sm:py-4 text-right w-[10%] text-[14px] sticky top-0 z-30 bg-stone-100/[0.98] backdrop-blur-sm shadow-[inset_0_-1px_0_rgba(231,229,228,1)]">
                    Giờ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-stone-400">
                      Chưa có dữ liệu giá vàng.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-amber-50/40 transition-all group border-b border-stone-50"
                    >
                      <td className="px-4 sm:px-5 py-3 border-r border-stone-100">
                        <div
                          className="text-sm sm:text-[16px] font-bold text-stone-900 leading-tight whitespace-nowrap"
                          title={row.name}
                        >
                          {row.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 border-r border-stone-100">
                        <div className="text-base sm:text-[19px] font-bold text-stone-800 font-mono tracking-tighter whitespace-nowrap">
                          {formatPrice(row.buy_price)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 border-r border-stone-100">
                        <div className="text-base sm:text-[19px] font-black text-emerald-700 italic font-mono tracking-tighter whitespace-nowrap">
                          {formatPrice(row.sell_price)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-sm sm:text-[14px] text-stone-600 text-right font-mono font-bold whitespace-nowrap">
                        {row.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-stone-50/50 px-4 sm:px-6 py-3 border-t border-stone-100 flex justify-between items-center shrink-0">
            <p className="text-xs sm:text-sm text-stone-500">
              Tổng {totalCount.toLocaleString('vi-VN')} bản ghi
            </p>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-stone-400">
                Trang {page} / {totalPages}
              </span>
              <div className="flex border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={handlePrev}
                  disabled={page <= 1}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border-r border-stone-200 text-stone-600 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className="px-3 py-2 bg-white hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(GoldBtmc);
