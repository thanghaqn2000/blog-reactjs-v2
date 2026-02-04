import TopStock from './TopStock';

interface SidebarStockProps {
  className?: string;
}

const SidebarStock = ({ className = "" }: SidebarStockProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <TopStock />
    </div>
  );
};

export default SidebarStock; 
