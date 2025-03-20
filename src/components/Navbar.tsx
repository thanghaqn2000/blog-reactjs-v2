
import { ChevronDown, Menu, Search, User, X, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HeaderClient from './HeaderClient';
import { Button } from './ui/button';
import AdminLink from './AdminLink';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
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
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-display font-bold text-xl sm:text-2xl tracking-tight"
          >
            <span className={`${isScrolled ? 'text-primary' : 'text-primary'}`}>Stock</span>
            <span className={isScrolled ? 'text-foreground' : 'text-foreground'}>Insights</span>
          </Link>
          
          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:block">
            <HeaderClient isScrolled={isScrolled} />
          </div>
          
          {/* Search & Login & Mobile Menu Buttons */}
          <div className="flex items-center gap-2">
            <button 
              className={`p-2 rounded-full hover:bg-accent transition-colors ${!isScrolled ? 'text-white hover:bg-white/20' : 'text-foreground/80'}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <AdminLink isScrolled={isScrolled} />
            
            <Link to="/login">
              <Button 
                variant={isScrolled ? "default" : "outline"} 
                size="sm"
                className={!isScrolled ? "text-black border-white hover:bg-white/20 hover:text-white" : ""}
              >
                <User size={16} className="mr-2" />
                Đăng nhập
              </Button>
            </Link>
            
            <button
              className={`p-2 rounded-full hover:bg-accent transition-colors md:hidden ${!isScrolled ? 'text-white hover:bg-white/20' : 'text-foreground'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
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
        <ChevronDown 
          size={16} 
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
