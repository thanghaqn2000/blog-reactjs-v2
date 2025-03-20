
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

interface AdminLinkProps {
  isScrolled?: boolean;
}

const AdminLink = ({ isScrolled = true }: AdminLinkProps) => {
  return (
    <Link to="/admin">
      <Button 
        variant={isScrolled ? "outline" : "outline"} 
        size="sm"
        className={!isScrolled ? "text-black border-white hover:bg-white/20 hover:text-white" : ""}
      >
        <LayoutDashboard size={16} className="mr-2" />
        Admin
      </Button>
    </Link>
  );
};

export default AdminLink;
