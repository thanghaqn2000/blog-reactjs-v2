import MainLayout from "@/layouts/MainLayout";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

const ExchangeRateVci = lazy(() => import("@/components/ExchangeRateVci"));
const GoldBtmc = lazy(() => import("@/components/GoldBtmc"));

type Tab = "exchange" | "gold";

const tabs: { key: Tab; label: string }[] = [
  { key: "exchange", label: "Tỷ giá ngoại tệ" },
  { key: "gold", label: "Bảng giá vàng" },
];

const ExchangeRate = () => {
  const [activeTab, setActiveTab] = useState<Tab>("exchange");

  return (
    <MainLayout>
      <div className="container py-16 pt-28">
        {/* Header with tabs */}
        <div className="flex justify-center mb-8 gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          }
        >
          {activeTab === "exchange" ? <ExchangeRateVci /> : <GoldBtmc />}
        </Suspense>
      </div>
    </MainLayout>
  );
};

export default ExchangeRate;
