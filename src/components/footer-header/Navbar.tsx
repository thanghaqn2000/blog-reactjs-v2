import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToast } from '@/config/toast.config';
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  faBars,
  faChevronDown,
  faCrown,
  faSignOutAlt,
  faTableCellsLarge,
  faTimes,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import HeaderClient from './HeaderClient';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.require_phone_number && !user?.phone_number) {
      showToast.error("Hãy cập nhật số điện thoại");
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo + ORCA text - responsive: fit within navbar height */}
          <Link 
            to="/" 
            className="flex items-center cursor-pointer gap-2.5 shrink-0"
          >
            <img 
              src="/logo-orca.png" 
              alt="ORCA" 
              className="max-h-14 sm:max-h-20 w-auto object-contain flex-shrink-0"
            />
            <span className="text-purple-900 font-display font-bold tracking-tight text-xl sm:text-[28px] whitespace-nowrap">
              ORCA
            </span>
          </Link>
          
          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:block">
            <HeaderClient isScrolled={isScrolled} />
          </div>
          
          {/* Search & Login & Mobile Menu Buttons */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="ml-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={(user?.is_admin || user?.is_vip) ? "sm" : "icon"}
                    className={cn(
                      "ml-2 flex items-center overflow-hidden transition-colors border rounded-xl",
                      (user?.is_admin || user?.is_vip)
                        ? "gap-2 py-1.5 pl-2.5 pr-2 border-amber-200/80 bg-amber-50/90 hover:bg-amber-100/90 text-gray-800"
                        : "p-0 rounded-full border-transparent hover:bg-gray-100"
                    )}
                  >
                    {(user?.is_admin || user?.is_vip) && (
                      <>
                        <FontAwesomeIcon
                          icon={faCrown}
                          className="h-3.5 w-3.5 text-amber-500 shrink-0"
                        />
                        <span className="flex flex-col items-start leading-tight">
                          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
                            Premium
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {user?.is_admin ? "Admin User" : "VIP"}
                          </span>
                        </span>
                      </>
                    )}
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="shrink-0">
                        <FontAwesomeIcon icon={faUser} className="h-8 w-8 text-primary" />
                      </span>
                    )}
                    {(user?.is_admin || user?.is_vip) && (
                      <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-gray-500 ml-0.5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center cursor-pointer">
                        <FontAwesomeIcon icon={faTableCellsLarge} className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="mt-2 flex items-center text-red-600 cursor-pointer">
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  variant="default"
                  size="sm"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}
            <button
              className="p-2 rounded-full hover:bg-accent transition-colors md:hidden text-foreground hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FontAwesomeIcon icon={faTimes} size="lg" />
              ) : (
                <FontAwesomeIcon icon={faBars} size="lg" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              <MobileNavLink to="/" label="Trang chủ" className='text-black'/>
              <MobileNavLink to="/markets" label="Thị trường" className='text-black'/>
              <MobileDropdownLink label="Đầu tư">
                <MobileNavLink to="/investment/stocks" label="Cổ phiếu chứng khoán" className="pl-4" />
                <MobileNavLink to="/investment/crypto" label="Tiền điện tử" className="pl-4" />
              </MobileDropdownLink>
              <MobileNavLink to="/articles" label="Bài viết" className='text-black'/>
              <MobileNavLink to="/chat" label="Chat AI" className='text-black'/>
              <MobileNavLink to="/feedback" label="Phản hồi của khách hàng" className='text-black'/>
              <MobileNavLink to="/exchange-rate" label="Bảng giá vàng / tỷ giá ngoại tệ" className='text-black'/>
              <MobileNavLink to="/stock-insight" label=" TOP cổ phiếu mạnh 👑" className='text-black'/>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ to, label, className = "" }: { to: string; label: string; className?: string }) => {
  return (
    <Link 
      to={to} 
      className={`py-2 text-black text-lg font-medium text-foreground/90 hover:text-primary transition-colors ${className}`}
    >
      {label}
    </Link>
  );
};

// Mobile Dropdown Link
const MobileDropdownLink = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-lg font-medium text-foreground/90 hover:text-primary transition-colors"
      >
        {label}
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="mt-1 ml-2 space-y-1 border-l-2 border-primary/10">
          {children}
        </div>
      )}
    </div>
  );
};

export default Navbar;
