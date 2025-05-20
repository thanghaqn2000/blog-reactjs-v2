
import LongNews from "@/components/LongNews";
import ShortNews from "@/components/ShortNews";
import VipUpgradeModal from "@/components/VipUpgradeModal";
import MainLayout from "@/layouts/MainLayout";
import { useState } from "react";

const VipNews = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <MainLayout>
      {/* Full-width background wrapper with gradient from login */}
      <div className="w-full">
        <div className="container py-16">
          <div className="mb-8 pt-12">
            <h1 className="text-3xl font-bold mb-2 text-white">VIP Financial News</h1>
            <p className="text-white/80">
              Exclusive insights and analysis for financial decision-makers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ShortNews />
            <LongNews />
          </div>
        </div>
      </div>
      
      <VipUpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </MainLayout>
  );
};

export default VipNews;
