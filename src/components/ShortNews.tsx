
import { useState } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import VipUpgradeModal from "./VipUpgradeModal";

const sampleShortNews = [
  {
    id: 1,
    title: "Market Update",
    summary: "S&P 500 rises for the third consecutive day.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    title: "Tech Stocks",
    summary: "Major tech companies announce quarterly results.",
    timestamp: "11:15 AM",
  },
  {
    id: 3,
    title: "Economic Indicators",
    summary: "Unemployment rate drops to 4.5% in Q2.",
    timestamp: "12:00 PM",
  },
  {
    id: 4,
    title: "Federal Reserve",
    summary: "Fed signals potential interest rate changes.",
    timestamp: "1:45 PM",
  },
  {
    id: 5,
    title: "Commodities",
    summary: "Oil prices stabilize after volatile week.",
    timestamp: "2:30 PM",
  },
];

const ShortNews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewsClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Short News</h2>
      <div className="space-y-3">
        {sampleShortNews.map((news) => (
          <Card 
            key={news.id} 
            className="cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={handleNewsClick}
          >
            <CardContent className="pt-4 pb-2 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-t-lg z-10">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-base">{news.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{news.summary}</p>
            </CardContent>
            <CardFooter className="py-2 text-xs text-muted-foreground">
              {news.timestamp}
            </CardFooter>
          </Card>
        ))}
      </div>
      <VipUpgradeModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ShortNews;
