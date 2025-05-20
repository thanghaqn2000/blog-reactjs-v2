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
  faSignOutAlt,
  faTimes,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminLink from '../AdminLink';
import { Button } from '../ui/button';
import HeaderClient from './HeaderClient';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
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
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-display font-bold text-xl sm:text-2xl tracking-tight cursor-pointer"
          >
            <span className={cn(
              "text-primary"
            )}>Stock</span>
            <span className="text-foreground">Insights</span>
          </Link>
          
          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:block">
            <HeaderClient isScrolled={isScrolled} />
          </div>
          
          {/* Search & Login & Mobile Menu Buttons */}
          <div className="flex items-center gap-2">
            
            {user?.is_admin && (
              <AdminLink isScrolled={isScrolled} />
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "ml-2 rounded-full bg-blue-100/80 hover:bg-blue-200/80 transition-colors",
                      isScrolled ? "text-gray-600 hover:text-black" : "text-white hover:text-white/80"
                    )}
                  >
                    <FontAwesomeIcon icon={faUser} className="h-8 w-8 text-blue-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
              className={`p-2 rounded-full hover:bg-accent transition-colors md:hidden ${!isScrolled ? 'text-white hover:bg-white/20' : 'text-foreground'}`}
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
              <MobileNavLink to="/" label="Home" className='text-black'/>
              
              <MobileDropdownLink label="Investment">
                <MobileNavLink to="/investment/stocks" label="Stocks" className="pl-4" />
                <MobileNavLink to="/investment/crypto" label="Cryptocurrency" className="pl-4" />
              </MobileDropdownLink>
              
              <MobileDropdownLink label="Policy">
                <MobileNavLink to="/policy/fiscal" label="Fiscal Policy" className="pl-4" />
                <MobileNavLink to="/policy/monetary" label="Monetary Policy" className="pl-4" />
              </MobileDropdownLink>
              
              <MobileDropdownLink label="Owner">
                <MobileNavLink to="/owner/profile" label="Profile" className="pl-4" />
                <MobileNavLink to="/owner/settings" label="Settings" className="pl-4" />
              </MobileDropdownLink>
              
              <MobileNavLink to="/articles" label="Articles" />
              <MobileNavLink to="/markets" label="Markets" />
              <MobileNavLink to="/admin" label="Admin Dashboard" />
              <MobileNavLink to="/login" label="Đăng nhập" />
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
