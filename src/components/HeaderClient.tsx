import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link, useLocation } from 'react-router-dom';

interface HeaderClientProps {
  isScrolled: boolean;
}

const HeaderClient = ({ isScrolled }: HeaderClientProps) => {
  const location = useLocation();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <Link to="/" className={`${navigationMenuTriggerStyle()} ${location.pathname === '/' ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Home
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={`${location.pathname.includes('/investment') ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Investment
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 bg-white shadow-lg rounded-md">
              <li>
                <Link to="/investment/stocks" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Stocks
                </Link>
              </li>
              <li>
                <Link to="/investment/crypto" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Cryptocurrency
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={`${location.pathname.includes('/policy') ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Policy
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 bg-white shadow-lg rounded-md">
              <li>
                <Link to="/policy/fiscal" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Fiscal Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/monetary" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Monetary Policy
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={`${location.pathname.includes('/owner') ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Owner
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 bg-white shadow-lg rounded-md">
              <li>
                <Link to="/owner/profile" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/owner/settings" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Settings
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/articles" className={`${navigationMenuTriggerStyle()} ${location.pathname.includes('/articles') ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Articles
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/markets" className={`${navigationMenuTriggerStyle()} ${location.pathname.includes('/markets') ? 'text-primary' : ''} ${!isScrolled ? 'text-black hover:text-white hover:bg-white/20' : ''}`}>
            Markets
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default HeaderClient; 
