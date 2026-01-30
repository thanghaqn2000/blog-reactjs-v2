
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
        Trang chủ
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
              Đầu tư
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/investment/stocks" className="px-3 py-2 cursor-pointer">
                Cổ phiếu chứng khoán
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/investment/crypto" className="px-3 py-2 cursor-pointer">
                Tiền điện tử
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
              Chính sách
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/policy/fiscal" className="px-3 py-2 cursor-pointer">
                Chính sách tài khóa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/policy/monetary" className="px-3 py-2 cursor-pointer">
                Chính sách tiền tệ
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
              Quản lý
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-md min-w-[200px]">
            <DropdownMenuItem asChild>
              <Link to="/owner/profile" className="px-3 py-2 cursor-pointer">
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/owner/settings" className="px-3 py-2 cursor-pointer">
                Cài đặt
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
        Bài viết
      </Link>
      
      <Link 
        to="/chat" 
        className={cn(
          menuItemStyle,
          location.pathname.includes('/chat') ? activeStyle : "",
          scrolledStyle
        )}
      >
        Chat AI
      </Link>
      
      <Link 
        to="/markets" 
        className={cn(
          menuItemStyle,
          location.pathname.includes('/markets') ? activeStyle : "",
          scrolledStyle
        )}
      >
        Thị trường
      </Link>
    </nav>
  );
};

export default HeaderClient;
