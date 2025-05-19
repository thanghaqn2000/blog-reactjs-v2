
import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface AdminLinkProps {
  isScrolled?: boolean;
}

const AdminLink = ({ isScrolled = true }: AdminLinkProps) => {
  return (
    <Link to="/admin">
      <Button 
        variant={"outline"} 
        size="sm"
      >
        <LayoutDashboard size={16} className="mr-2" />
        Admin
      </Button>
    </Link>
  );
};

export default AdminLink;
