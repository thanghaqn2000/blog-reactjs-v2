import EconomicCalendar from './widget/EconomicCalendar';
import FireAntWidget from './widget/FireAntWidget';
import TickerTape from './widget/TickerTape';
import TopStock from './TopStock';

interface SidebarStockProps {
  className?: string;
}

const SidebarStock = ({ className = "" }: SidebarStockProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <TickerTape />
      <TopStock />
      <FireAntWidget />
      <EconomicCalendar />
    </div>
  );
};

export default SidebarStock; 
