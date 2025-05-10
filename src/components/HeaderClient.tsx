
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderClientProps {
  isScrolled: boolean;
}

const HeaderClient = ({ isScrolled }: HeaderClientProps) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const menuItemStyle = "px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none";
  const activeStyle = "text-primary";
  const scrolledStyle =  "cursor-pointer text-black hover:text-black hover:bg-white/20";
  
  const handleMouseEnter = (menu: string) => {
    setOpenDropdown(menu);
  };
  
  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };
  
  return (
    <nav className="flex items-center space-x-1">
      <Link 
        to="/" 
        className={cn(
          menuItemStyle,
          location.pathname === '/' ? activeStyle : "",
          scrolledStyle
        )}
      >
        Home
      </Link>
      
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('investment')} 
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenu open={openDropdown === 'investment'}>
          <DropdownMenuTrigger 
            className={cn(
              menuItemStyle,
              "flex items-center gap-1",
              location.pathname.includes('/investment') ? activeStyle : "",
              scrolledStyle
            )}
            asChild
          >
            <div>
              Investment
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/investment/stocks" className="px-3 py-2 cursor-pointer">
                Stocks
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/investment/crypto" className="px-3 py-2 cursor-pointer">
                Cryptocurrency
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('policy')} 
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenu open={openDropdown === 'policy'}>
          <DropdownMenuTrigger 
            className={cn(
              menuItemStyle,
              "flex items-center gap-1",
              location.pathname.includes('/policy') ? activeStyle : "",
              scrolledStyle
            )}
            asChild
          >
            <div>
              Policy
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/policy/fiscal" className="px-3 py-2 cursor-pointer">
                Fiscal Policy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/policy/monetary" className="px-3 py-2 cursor-pointer">
                Monetary Policy
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('owner')} 
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenu open={openDropdown === 'owner'}>
          <DropdownMenuTrigger 
            className={cn(
              menuItemStyle,
              "flex items-center gap-1",
              location.pathname.includes('/owner') ? activeStyle : "",
              scrolledStyle
            )}
            asChild
          >
            <div>
              Owner
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/owner/profile" className="px-3 py-2 cursor-pointer">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/owner/settings" className="px-3 py-2 cursor-pointer">
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Link 
        to="/articles" 
        className={cn(
          menuItemStyle,
          location.pathname.includes('/articles') ? activeStyle : "",
          scrolledStyle
        )}
      >
        Articles
      </Link>
      
      <Link 
        to="/markets" 
        className={cn(
          menuItemStyle,
          location.pathname.includes('/markets') ? activeStyle : "",
          scrolledStyle
        )}
      >
        Markets
      </Link>
    </nav>
  );
};

export default HeaderClient;
