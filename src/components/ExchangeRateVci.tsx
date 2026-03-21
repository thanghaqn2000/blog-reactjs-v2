import { ExchangeRateItem, exchangeRateV1Service } from '@/services/v1/exchange_rate.service';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ITEMS_PER_PAGE = 10;

const formatDateParam = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const todayStr = formatDateParam(new Date());

function ExchangeRateVci() {
  const [pagedData, setPagedData] = useState<ExchangeRateItem[]>([]);
  const [fullData, setFullData] = useState<ExchangeRateItem[]>([]);
  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalCount, setServerTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => formatDateParam(new Date()));
  const [fullDataLoaded, setFullDataLoaded] = useState(false);
  const [clock, setClock] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isRealTime = selectedDate === todayStr;

  const fetchPagedData = useCallback(async (date: string, p: number) => {
    try {
      setLoading(true);
      const res = await exchangeRateV1Service.getExchangeRates(date, p, ITEMS_PER_PAGE);
      setPagedData(res.data);
      setServerTotalPages(res.meta.total_pages);
      setServerTotalCount(res.meta.total_count);
    } catch (error) {
      console.error('Failed to fetch exchange rates', error);
      setPagedData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFullData = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const first = await exchangeRateV1Service.getExchangeRates(date, 1, ITEMS_PER_PAGE);
      let allData = [...first.data];
      const tp = first.meta.total_pages;
      if (tp > 1) {
        const rest = await Promise.all(
          Array.from({ length: tp - 1 }, (_, i) =>
            exchangeRateV1Service.getExchangeRates(date, i + 2, ITEMS_PER_PAGE),
          ),
        );
        allData = [...allData, ...rest.flatMap((r) => r.data)];
      }
      setFullData(allData);
      setFullDataLoaded(true);
    } catch (error) {
      console.error('Failed to fetch all exchange rates', error);
      setFullData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    if (isSearching) {
      if (!fullDataLoaded) fetchFullData(selectedDate);
    } else {
      fetchPagedData(selectedDate, page);
    }
  }, [selectedDate, page, isSearching, fullDataLoaded, fetchPagedData, fetchFullData]);

  useEffect(() => {
    setFullDataLoaded(false);
    setFullData([]);
  }, [selectedDate]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      const h = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClock(`${d}/${m}/${y} — ${h}:${mi}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (!isSearching) return pagedData;
    const term = search.toLowerCase();
    return fullData.filter(
      (item) =>
        item.currency_code.toLowerCase().includes(term) ||
        item.currency_name.toLowerCase().includes(term),
    );
  }, [search, isSearching, pagedData, fullData]);

  const totalPages = isSearching
    ? Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    : serverTotalPages;
  const totalCount = isSearching ? filtered.length : serverTotalCount;
  const displayed = isSearching
    ? filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : filtered;

  /** API trả chuỗi kiểu Mỹ: "29,658.06" (phẩy nghìn, chấm thập phân). */
  const formatVal = (val: string) => {
    if (val === '-') return <span className="text-gray-300 italic text-xs">Chờ cập nhật</span>;
    const normalized = val.replace(/,/g, '').trim();
    const num = Number(normalized);
    if (isNaN(num)) return val;
    // Cùng kiểu hiển thị VND: làm tròn đồng nguyên (USD .00 và các mã có xu đều thống nhất)
    const rounded = Math.round(num);
    return `${rounded.toLocaleString('vi-VN')}đ`;
  };

  const historyDateDisplay = (() => {
    const d = new Date(selectedDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  })();

  const handleResetToRealTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(todayStr);
    setPage(1);
    if (dateInputRef.current) dateInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto border border-gray-200 rounded-2xl shadow-lg overflow-hidden bg-white flex flex-col h-[85vh]">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-r-2 border-orange-500 rotate-45" />
          </div>
          <span className="font-bold text-lg sm:text-2xl tracking-tight italic text-gray-800 uppercase">
            ORCA<span className="text-orange-500">CURRENCY</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
            {isRealTime ? (
              <>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                  Cập nhật real-time
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
                  Dữ liệu lịch sử
                </span>
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
              </>
            )}
          </div>
          <div className="sm:hidden">
            {isRealTime ? (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse block" />
            ) : (
              <span className="w-2 h-2 bg-orange-500 rounded-full block" />
            )}
          </div>
          <div className="w-8 h-5 bg-red-600 relative overflow-hidden rounded shadow-sm flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 bg-yellow-400 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" />
          </div>
        </div>
      </div>

      {/* Dashboard Title & Search & Calendar */}
      <div className="flex-none px-4 sm:px-8 py-5 sm:py-8 flex flex-col gap-4 sm:gap-6 border-b border-gray-50">
        {/* Title */}
        <div className="flex flex-col border-l-4 border-orange-500 pl-4 sm:pl-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
            Tỷ Giá Ngoại Tệ
          </h1>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Nguồn:
            </span>
            <div className="flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              <span className="text-[10px] font-black text-[#7AB51D] uppercase tracking-wider">
                Vietcombank
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
          {/* Search */}
          <div className="flex-1 max-w-md w-full flex flex-col gap-2">
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo mã hoặc tên ngoại tệ..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all shadow-sm"
              />
              <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic pl-1">
              * lưu ý: số liệu chỉ có giá trị tại thời điểm lịch sử tham khảo
            </p>
          </div>

          {/* Calendar */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div
              onClick={() => dateInputRef.current?.showPicker()}
              className="relative flex items-center gap-3 sm:gap-4 bg-orange-50 border border-orange-100 px-4 sm:px-6 py-3 rounded-xl text-gray-800 font-bold text-base sm:text-lg shadow-sm cursor-pointer hover:bg-orange-100/60 hover:border-amber-300 transition-all w-full sm:w-auto sm:min-w-[280px]"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 shrink-0" />
              <span className="tabular-nums truncate">
                {isRealTime ? clock || 'Đang tải...' : `Lịch sử: ${historyDateDisplay}`}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 w-0 h-0"
                onChange={(e) => {
                  if (!e.target.value) return;
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
              />
              {!isRealTime && (
                <button
                  onClick={handleResetToRealTime}
                  className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md hover:bg-orange-600 transition-all"
                >
                  Trở lại
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold italic tracking-tight lg:text-right w-full">
              * Nhấp vào đồng hồ để tra cứu theo ngày lịch sử.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        <table
          className="w-full text-left min-w-[750px]"
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-gray-50 text-[11px] sm:text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-4 sm:px-8 py-3 sm:py-4 whitespace-nowrap bg-gray-50 border-b border-gray-100">
                Mã NT
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
                Tên ngoại tệ
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap bg-gray-50 border-b border-gray-100">
                Mua tiền mặt
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap bg-gray-50 border-b border-gray-100">
                Mua chuyển khoản
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-green-600 bg-gray-50 border-b border-gray-100">
                Bán ra
              </th>
              <th className="px-4 sm:px-8 py-3 sm:py-4 text-right whitespace-nowrap text-amber-500 bg-gray-50 border-b border-gray-100">
                Cập nhật
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  Không tìm thấy ngoại tệ phù hợp
                </td>
              </tr>
            ) : (
              displayed.map((item) => (
                <tr
                  key={item.currency_code}
                  className="hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black">
                      {item.currency_code}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-6 font-bold text-gray-900 text-base sm:text-lg italic whitespace-nowrap">
                    {item.currency_name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-6 text-right font-bold text-base sm:text-lg text-gray-900 tabular-nums whitespace-nowrap">
                    {formatVal(item['buy _cash'])}
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-6 text-right font-bold text-base sm:text-lg text-gray-900 tabular-nums whitespace-nowrap">
                    {formatVal(item['buy _transfer'])}
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-6 text-right font-bold text-base sm:text-lg text-emerald-600 tabular-nums whitespace-nowrap">
                    {formatVal(item.sell)}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-right text-xs sm:text-sm text-amber-500 font-bold whitespace-nowrap">
                    {item.date
                      ? new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : historyDateDisplay}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex-none px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/30 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500">
          Hiển thị <span className="font-bold text-gray-800">{displayed.length}</span> trên tổng số{' '}
          <span className="font-bold text-gray-800">{totalCount}</span> ngoại tệ
          {isSearching && serverTotalCount !== totalCount && (
            <span className="text-gray-400 ml-1">(tổng {serverTotalCount})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-sm ${
                  p === page
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ExchangeRateVci);
