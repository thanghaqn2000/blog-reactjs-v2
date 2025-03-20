
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 font-display font-bold text-xl tracking-tight mb-4">
              <span className="text-primary">Stock</span>
              <span>Insights</span>
            </Link>
            <p className="text-sm text-foreground/70 mb-6">
              In-depth analysis and insights to help you navigate the financial markets with confidence.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon="twitter" />
              <SocialLink href="#" icon="linkedin" />
              <SocialLink href="#" icon="facebook" />
              <SocialLink href="#" icon="instagram" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/articles" label="Articles" />
              <FooterLink to="/markets" label="Markets" />
              <FooterLink to="/analysis" label="Analysis" />
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-medium text-base mb-4">Resources</h3>
            <ul className="space-y-3">
              <FooterLink to="/glossary" label="Financial Glossary" />
              <FooterLink to="/tools" label="Calculators & Tools" />
              <FooterLink to="/newsletter" label="Newsletter" />
              <FooterLink to="/faq" label="FAQ" />
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-medium text-base mb-4">Company</h3>
            <ul className="space-y-3">
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/contact" label="Contact" />
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms of Service" />
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60 mb-4 md:mb-0">
            © {new Date().getFullYear()} Stock Insights. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social Icon Link
const SocialLink = ({ href, icon }: { href: string; icon: string }) => {
  return (
    <a 
      href={href} 
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-primary hover:text-white transition-colors"
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={`Follow us on ${icon}`}
    >
      <IconPlaceholder name={icon} />
    </a>
  );
};

// Footer Navigation Link
const FooterLink = ({ to, label }: { to: string; label: string }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="text-sm text-foreground/70 hover:text-primary transition-colors"
      >
        {label}
      </Link>
    </li>
  );
};

// Placeholder for social icons
const IconPlaceholder = ({ name }: { name: string }) => {
  return (
    <div className="w-4 h-4 text-current">{name.charAt(0).toUpperCase()}</div>
  );
};

export default Footer;
