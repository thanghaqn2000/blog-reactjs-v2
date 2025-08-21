import ChartStock from './ChartStock';
import TopStock from './TopStock';

// Types
interface RankedStock {
  id: number;
  name: string;
  price: number;
  change: number;
  rank: number;
}

interface FundGrowthData {
  day: string;
  value: number;
}

interface SidebarStockProps {
  rankedStocks: RankedStock[];
  className?: string;
}

const SidebarStock = ({ rankedStocks, className = "" }: SidebarStockProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <TopStock rankedStocks={rankedStocks} />
      <ChartStock />
    </div>
  );
};

export default SidebarStock; 
