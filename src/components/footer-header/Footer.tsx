
import { faFacebook, faInstagram, faLinkedin, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 font-display font-bold text-xl tracking-tight mb-4">
              <span className="text-primary">ORCA</span>
            </Link>
            <p className="text-sm text-foreground/70 mb-6">
              Phân tích sâu sắc và thông tin để giúp bạn điều hướng thị trường tài chính với độ tin cậy.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={faFacebook} color="text-blue-600" />
              <SocialLink href="#" icon={faLinkedin} color="text-blue-700" />
              <SocialLink href="#" icon={faInstagram} color="text-sky-500" />
              <SocialLink href="#" icon={faTiktok} color="text-red-600" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-base mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/articles" label="Bài viết" />
              <FooterLink to="/markets" label="Thị trường" />
              <FooterLink to="/analysis" label="Phân tích" />
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-medium text-base mb-4">Danh mục</h3>
            <ul className="space-y-3">
              <FooterLink to="/glossary" label="Bản tin" />
              <FooterLink to="/tools" label="Đầu tư" />
              <FooterLink to="/newsletter" label="Siêu trợ lí AI" />
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-medium text-base mb-4">Về ORCA</h3>
            <ul className="space-y-3">
              <FooterLink to="/about" label="Về chúng tôi" />
              <FooterLink to="/contact" label="Liên hệ" />
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60 mb-4 md:mb-0">
            © {new Date().getFullYear()} ORCA. Tất cả quyền được bảo lưu.
          </p>
          
          {/* <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Chính sách riêng tư
            </Link>
            <Link to="/terms" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link to="/cookies" className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors">
              Cookie
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

// Social Icon Link
const SocialLink = ({ href, icon, color = "text-gray-600" }: { href: string; icon: any; color?: string }) => {
  return (
    <a 
      href={href} 
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-primary hover:text-white transition-colors ${color}`}
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={`Follow us on ${icon}`}
    >
      <FontAwesomeIcon icon={icon as any} />
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
