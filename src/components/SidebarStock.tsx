import FireAntWidget from './FireAntWidget';
import TopStock from './TopStock';

interface SidebarStockProps {
  className?: string;
}

const SidebarStock = ({ className = "" }: SidebarStockProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <TopStock />
      <FireAntWidget />
    </div>
  );
};

export default SidebarStock; 
