import MainLayout from "@/layouts/MainLayout";
import {
  StockInsightData,
  TopStockItem,
  topStockV1Service,
} from "@/services/v1/top_stock_v1.service";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MinusCircle,
  Search,
  TrendingUp,
  Volume2,
  Waves,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type MarketSignalStatus = 'positive' | 'neutral' | 'negative';

interface MarketData {
  index_value: number;
  index_pct: number;
  index_trend_label: string;
  advancing_count: number;
  declining_count: number;
  ma50_pct: number;
  ma100_pct: number;
  ma200_pct: number;
  market_regime: string;
  regime_desc: string;
  signal_ma200: MarketSignalStatus;
  signal_breadth: MarketSignalStatus;
  signal_ma50: MarketSignalStatus;
}

interface StockItem {
  t: string;
  rs: number;
  vol20D: number;
}

interface RankedStockItem extends StockItem {
  dynamicRank: number;
}

type SortKey = 'rs' | 'vol20D' | null;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface MarketSignal {
  label: string;
  status: MarketSignalStatus;
}

interface MarketRegime {
  state: string;
  description: string;
  signals: MarketSignal[];
}


const formatVol = (val: number): string => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
  return String(val);
};

const StockInsight = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'rs', direction: 'desc' });
  const [time, setTime] = useState(new Date());
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(true);
  const [loadingMarketData, setLoadingMarketData] = useState<boolean>(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("✨ ORCA System Analysis");

  const audioSource = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(timer); stopAudio(); };
  }, []);

  // Load market insight + stock data from API
  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingStocks(true);
      setLoadingMarketData(true);

      try {
        // Stock list for Momentum Matrix
        const [topStocksRes, insightRes] = await Promise.all([
          topStockV1Service.getTopStocks(500),
          topStockV1Service.getStockInsight(),
        ]);

        const mapped: StockItem[] = (topStocksRes.data ?? []).map((item: TopStockItem) => ({
          t: item.symbol,
          rs: Number(item.rs_value),
          vol20D: Number(item.vol_20d),
        }));
        setStocks(mapped);
        setLoadingStocks(false);

        const raw: StockInsightData | undefined = insightRes.data;
        if (raw) {
          const vnClose = Number(raw.vnindex_close);
          const indexPct = Number(raw.index_pct);

          const mapSignal = (val: string): MarketSignalStatus => {
            const v = val.toLowerCase();
            if (v === "bullish" || v === "positive") return "positive";
            if (v === "bearish" || v === "negative") return "negative";
            return "neutral";
          };

          const mapTrendLabel = (val: string): string => {
            const v = val.toLowerCase();
            if (v === "bullish") return "Bullish";
            if (v === "bearish") return "Bearish";
            if (v === "neutral") return "Neutral";
            return val.toUpperCase();
          };

          setMarketData({
            index_value: vnClose,
            index_pct: Number((indexPct * 100).toFixed(2)),
            index_trend_label: mapTrendLabel(raw.signal_ma200),
            advancing_count: raw.advancing,
            declining_count: raw.declining,
            ma50_pct: Number((Number(raw.pct_above_ma50) * 100).toFixed(2)),
            ma100_pct: Number((Number(raw.pct_above_ma100) * 100).toFixed(2)),
            ma200_pct: Number((Number(raw.pct_above_ma200) * 100).toFixed(2)),
            market_regime: raw.market_regime,
            regime_desc: raw.regime_desc,
            signal_ma200: mapSignal(raw.signal_ma200),
            signal_breadth: mapSignal(raw.signal_breadth),
            signal_ma50: mapSignal(raw.signal_ma50),
          });
        }
        setLoadingMarketData(false);
      } catch (error) {
        console.error("Failed to fetch stock insight data", error);
        setStocks([]);
        setLoadingStocks(false);
        setLoadingMarketData(false);
      }
    };

    fetchInsights();
  }, []);

  // Simplified Market Regime derived strictly from marketData fields
  const marketRegime: MarketRegime = useMemo(() => {
    if (!marketData) {
      return {
        state: "",
        description: "",
        signals: [],
      };
    }
    return {
      state: marketData.market_regime,
      description: marketData.regime_desc,
      signals: [
        { label: "VNINDEX vs MA200", status: marketData.signal_ma200 },
        { label: "Advance vs Decline", status: marketData.signal_breadth },
        { label: "% Stocks Above MA50", status: marketData.signal_ma50 },
      ],
    };
  }, [marketData]);

  const processedData: RankedStockItem[] = useMemo(() => {
    const rankedBase = [...stocks]
      .sort((a, b) => b.rs - a.rs)
      .map((item, index) => ({
        ...item,
        dynamicRank: index + 1
      }));

    let items = rankedBase.filter(item => 
      item.t.toUpperCase().includes(searchTerm.toUpperCase())
    );

    if (sortConfig && sortConfig.key !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [stocks, searchTerm, sortConfig]);

  const pcmToWav = (pcmData: Uint8Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    view.setUint32(0, 0x52494646, false); 
    view.setUint32(4, 36 + pcmData.length, true);
    view.setUint32(8, 0x57415645, false); 
    view.setUint32(12, 0x666d7420, false); 
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true);  
    view.setUint16(22, 1, true);  
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); 
    view.setUint16(32, 2, true);  
    view.setUint16(34, 16, true); 
    view.setUint32(36, 0x64617461, false); 
    view.setUint32(40, pcmData.length, true);
    for (let i = 0; i < pcmData.length; i += 2) {
      const byte1 = pcmData[i];
      const byte2 = pcmData[i+1];
      const value = (byte1 << 8) | byte2;
      view.setInt16(44 + i, value, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  // const speakInsight = async () => {
  //   if (!aiInsight || isSpeaking) { stopAudio(); return; }
  //   setIsSpeaking(true);
  //   try {
  //     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         contents: [{ parts: [{ text: `Giọng nam chuyên gia kinh tế: ${aiInsight}` }] }],
  //         generationConfig: { 
  //           responseModalities: ["AUDIO"], 
  //           speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } 
  //         }
  //       })
  //     });
  //     const result = await response.json() as any;
  //     const inlineData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  //     if (!inlineData) throw new Error();
  //     const binaryString = window.atob(inlineData.data);
  //     const bytes = new Uint8Array(binaryString.length);
  //     for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  //     const wavBlob = pcmToWav(bytes, parseInt(inlineData.mimeType.match(/rate=(\d+)/)?.[1] || "24000"));
  //     const audioUrl = URL.createObjectURL(wavBlob);
  //     const audio = new Audio(audioUrl);
  //     audioSource.current = audio;
  //     audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); };
  //     await audio.play();
  //   } catch (err) { setIsSpeaking(false); }
  // };

  const stopAudio = () => {
    if (audioSource.current) { audioSource.current.pause(); audioSource.current = null; }
    setIsSpeaking(false);
  };

  // const runAnalysis = async (stock: RankedStockItem | null = null) => {
  //   stopAudio();
  //   setIsAnalyzing(true);
  //   setAiInsight(null);
  //   setShowAiModal(true);
  //   setModalTitle(stock ? `🔍 Phân tích mã ${stock.t}` : "🧠 Nhận định Hệ thống");

  //   const prompt = stock 
  //     ? `Phân tích mã ${stock.t} (RS: ${stock.rs}, Rank: ${stock.dynamicRank}, Vol 20D: ${formatVol(stock.vol20D)}).`
  //     : `Dựa trên trạng thái thị trường ${marketRegime.state}. Đưa ra nhận định hệ thống.`;

  //   try {
  //     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         contents: [{ parts: [{ text: prompt }] }],
  //         systemInstruction: { parts: [{ text: "Bạn là thực thể AI ORCA System. Trả lời bằng tiếng Việt chuyên nghiệp, sâu sắc." }] }
  //       })
  //     });
  //     const result = await response.json() as any;
  //     setAiInsight(result.candidates?.[0]?.content?.parts?.[0]?.text);
  //   } catch (err) {
  //     setAiInsight("Lỗi kết nối bộ não AI.");
  //   } finally {
  //     setIsAnalyzing(false);
  //   }
  // };

  const breadthTotal = marketData
    ? marketData.advancing_count + marketData.declining_count
    : 0;
  const advWidth =
    marketData && breadthTotal
      ? (marketData.advancing_count / breadthTotal) * 100
      : 0;
  const decWidth =
    marketData && breadthTotal
      ? (marketData.declining_count / breadthTotal) * 100
      : 0;

  const indexStatusClasses = (() => {
    const status = marketData?.signal_ma200;
    if (status === "neutral") {
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
    if (status === "negative") {
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
    // default positive/undefined -> xanh
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  })();

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 sm:pt-32 pb-10 px-4 md:px-10 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">Orca <span className="text-indigo-600">System</span></h1>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> System Active
                </span>
                <span>•</span>
                <span>{time.toLocaleTimeString('vi-VN')}</span>
              </div>
            </div>
          </div>
          
          {/* <div className="flex gap-3">
            <button onClick={() => runAnalysis()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <Zap className="w-4 h-4" /> Momentum AI
            </button>
          </div> */}
        </header>

        {/* 1. Market Overview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* VNINDEX Hero Card */}
          {loadingMarketData ? (
            <div className="lg:col-span-4 bg-[#1e232e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
          <div className="lg:col-span-4 bg-[#1e232e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-40 h-40" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">VNINDEX CLOSE</p>
              <div className="flex items-baseline gap-3 mb-8">
              <span className="text-5xl font-black tracking-tighter">
                {marketData ? marketData.index_value.toLocaleString() : "--"}
              </span>
              {marketData && (() => {
                const pct = marketData.index_pct;
                const isPositive = pct > 0;
                const isNegative = pct < 0;
                const colorClass = isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-slate-400";
                const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : MinusCircle;
                const sign = isPositive ? "+" : "";
                
                return (
                  <span className={`${colorClass} font-bold flex items-center gap-0.5 text-lg`}>
                    <Icon className="w-5 h-5" /> {sign}{pct}%
                  </span>
                );
              })()}
              {!marketData && (
                <span className="text-slate-400 font-bold flex items-center gap-0.5 text-lg">
                  <MinusCircle className="w-5 h-5" /> 0%
                </span>
              )}
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Market Dominance</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="text-3xl font-black">{marketData?.advancing_count ?? 0}</span> ▲
                    </div>
                    <div className="h-6 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <span className="text-3xl font-black">{marketData?.declining_count ?? 0}</span> ▼
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${indexStatusClasses}`}
                  >
                    {marketData?.index_trend_label ?? ""}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${advWidth}%` }}></div>
                <div className="h-full bg-rose-500 transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: `${decWidth}%` }}></div>
              </div>
            </div>
          </div>
          )}

          {/* Technical Breadth Metrics */}
          {loadingMarketData ? (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Waves className="w-4 h-4 text-indigo-500" /> Technical Breadth Metrics
            </h3>
            <div className="space-y-6">
              <BreadthBar label="Stocks above MA50" value={marketData?.ma50_pct ?? 0} />
              <BreadthBar label="Stocks above MA100" value={marketData?.ma100_pct ?? 0} color="bg-blue-500" />
              <BreadthBar label="Stocks above MA200" value={marketData?.ma200_pct ?? 0} color="bg-emerald-500" />
            </div>
          </div>
          )}

          {/* Market Regime Card (Render-Only Logic) */}
          {loadingMarketData ? (
            <div className="lg:col-span-3 bg-[#11141b] rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
          <div className="lg:col-span-3">
             <MarketRegimeCard 
               status={marketRegime.state} 
               description={marketRegime.description} 
               signals={marketRegime.signals} 
             />
          </div>
          )}
        </div>

        {/* 2. Momentum Matrix */}
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
          <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-100 bg-slate-50/20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden bg-white">
                <img
                  src="/logo-orca.png"
                  alt="ORCA logo"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">XẾP HẠNG SỨC MẠNH</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank recalculated by RS Standing</p>
              </div>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm mã"
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loadingStocks ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-white shadow-sm">
                  <Th label="Mã" sortKey={null} current={sortConfig} onSort={setSortConfig} />
                  <Th label="Sức mạnh" sortKey="rs" current={sortConfig} onSort={setSortConfig} />
                  <Th label="Khối lượng TB 20 ngày" sortKey="vol20D" current={sortConfig} onSort={setSortConfig} />
                  <Th label="Xếp hạng" sortKey={null} current={sortConfig} onSort={setSortConfig} align="center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      Chưa có dữ liệu cổ phiếu.
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => (
                    <tr key={item.t} className="hover:bg-slate-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-600">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${item.rs > 95 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {item.t[0]}
                        </div>
                        <span className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{item.t}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${item.rs > 95 ? 'bg-indigo-600' : 'bg-slate-400'}`} 
                            style={{ width: `${item.rs}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-400 w-8">{item.rs.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-sm font-bold text-slate-500">{formatVol(item.vol20D)}</span>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className={`text-[11px] font-black px-3 py-1 rounded-full ${item.dynamicRank <= 5 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                        #{item.dynamicRank}
                      </span>
                    </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Intelligence Insight Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-10 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                    <BrainCircuit className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1 tracking-tight">{modalTitle}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cognitive Processing Node</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {aiInsight && !isAnalyzing && (
                    <button onClick={() => {}} className={`p-4 rounded-2xl transition-all ${isSpeaking ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200'}`}>
                      {isSpeaking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  )}
                  <button onClick={() => { setShowAiModal(false); stopAudio(); }} className="p-4 bg-slate-50 hover:bg-white hover:text-rose-600 rounded-2xl transition-all text-slate-400 border border-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-10 overflow-y-auto custom-scrollbar flex-grow">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6 opacity-20" />
                    <p className="text-xl font-black text-slate-900 mb-2">Synchronizing System Data...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg font-medium tracking-tight">
                        {aiInsight}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => { setShowAiModal(false); stopAudio(); }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Confirm Awareness</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
    </MainLayout>
  );
};

/**
 * Market Regime Card Component
 * Optimized for institutional presentation.
 * React iterates over signals and maps visual state to pre-calculated backend statuses.
 */
interface MarketRegimeCardProps {
  status: string;
  description: string;
  signals: MarketSignal[];
}

function MarketRegimeCard({ status, description, signals }: MarketRegimeCardProps) {
  const isRiskOn = status === "RISK-ON";
  const isNeutral = status === "NEUTRAL";
  const isRiskOff = status === "RISK-OFF";
  
  // Style mapping
  const accentColor = isRiskOn
    ? "text-emerald-500"          // RISK-ON: xanh lá
    : isNeutral
    ? "text-amber-500"           // NEUTRAL: vàng
    : isRiskOff
    ? "text-rose-500"            // RISK-OFF: đỏ
    : "text-slate-500";

  const glowShadow = isRiskOn
    ? "shadow-emerald-500/5"
    : isNeutral
    ? "shadow-amber-500/5"
    : isRiskOff
    ? "shadow-rose-500/5"
    : "shadow-slate-500/5";

  return (
    <div className={`h-full bg-[#11141b] rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between border border-white/5 ${glowShadow} transition-all`}>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Market Regime</p>
        <div className={`text-4xl font-black tracking-tighter ${accentColor}`}>{status}</div>
      </div>
      
      <p className="text-xs font-medium text-slate-400 leading-relaxed py-4">
        {description}
      </p>

      <div className="pt-6 border-t border-white/5 space-y-3">
        {signals.map((signal, i) => (
          <SignalRow key={i} label={signal.label} status={signal.status} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
};

/**
 * SignalRow Component
 * Decoupled visualization of a signal's pre-calculated status
 */
interface SignalRowProps {
  label: string;
  status: MarketSignalStatus;
  accentColor: string;
}

function SignalRow({ label, status, accentColor }: SignalRowProps) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      {status === "positive" ? (
        <CheckCircle2 className={`w-3.5 h-3.5 ${accentColor} opacity-80`} />
      ) : status === "neutral" ? (
        <MinusCircle className="w-3.5 h-3.5 text-amber-500 opacity-80" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 opacity-60" />
      )}
    </div>
  );
}

interface BreadthBarProps {
  label: string;
  value: number;
  color?: string;
}

function BreadthBar({ label, value, color = "bg-indigo-600" }: BreadthBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-900">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

interface ThProps {
  label: string;
  sortKey: SortKey;
  current: SortConfig;
  onSort: (config: SortConfig) => void;
  align?: "left" | "center" | "right";
}

function Th({ label, sortKey, current, onSort, align = "left" }: ThProps) {
  const isSortable = sortKey !== null;
  const active = current.key === sortKey;
  const toggle = () =>
    isSortable &&
    onSort({
      key: sortKey,
      direction: active && current.direction === 'desc' ? 'asc' : 'desc',
    });
  const alignClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  return (
    <th onClick={toggle} className={`px-10 py-6 ${isSortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''} group`}>
      <div className={`flex items-center gap-2 ${alignClass}`}>
        <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
        {isSortable && (
          <div className={`flex flex-col transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
            <ChevronUp className={`w-3 h-3 -mb-1 ${active && current.direction === 'asc' ? 'text-indigo-600' : 'text-slate-300'}`} />
            <ChevronDown className={`w-3 h-3 ${active && current.direction === 'desc' ? 'text-indigo-600' : 'text-slate-300'}`} />
          </div>
        )}
      </div>
    </th>
  );
}

export default StockInsight;
