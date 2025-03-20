
import { useState } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import VipUpgradeModal from "./VipUpgradeModal";

const sampleLongNews = [
  {
    id: 1,
    title: "Global Markets Analysis",
    summary: "A comprehensive review of market trends across major global exchanges this week.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
    author: "Financial Analyst Team",
    timestamp: "October 10, 2023",
  },
  {
    id: 2,
    title: "Investment Strategy Report",
    summary: "Expert recommendations for portfolio diversification in uncertain economic conditions.",
    content: "Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
    author: "Investment Advisory Group",
    timestamp: "October 9, 2023",
  },
  {
    id: 3,
    title: "Economic Outlook Q4 2023",
    summary: "Forecasting major economic indicators for the final quarter of the fiscal year.",
    content: "Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
    author: "Economic Research Department",
    timestamp: "October 8, 2023",
  },
];

const LongNews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewsClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Long News</h2>
      <div className="space-y-4">
        {sampleLongNews.map((news) => (
          <Card 
            key={news.id} 
            className="cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={handleNewsClick}
          >
            <CardContent className="pt-4 pb-2">
              <h3 className="font-medium text-lg">{news.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{news.summary}</p>
              <div className="mt-3 relative">
                <p className="text-sm line-clamp-2">{news.content.substring(0, 100)}...</p>
                <div className="absolute inset-0 top-[50%] flex items-end justify-center bg-gradient-to-t from-background to-transparent pt-6 z-10">
                  <div className="bg-background/60 backdrop-blur-sm w-full flex justify-center py-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2 text-xs text-muted-foreground justify-between">
              <span>{news.author}</span>
              <span>{news.timestamp}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
      <VipUpgradeModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LongNews;
