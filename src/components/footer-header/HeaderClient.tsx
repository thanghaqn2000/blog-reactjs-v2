import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Crown, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface HeaderClientProps {
  isScrolled: boolean;
}

const HeaderClient = ({ isScrolled }: HeaderClientProps) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user } = useAuth();

  const baseItem =
    "px-3 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none whitespace-nowrap";
  const inactiveItem =
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 cursor-pointer";
  const activeItem = "bg-[#EEF0FF] text-primary cursor-pointer";

  const handleMouseEnter = (menu: string) => setOpenDropdown(menu);
  const handleMouseLeave = () => setOpenDropdown(null);

  return (
    <nav className="flex items-center gap-0.5">
      <Link
        to="/"
        className={cn(
          baseItem,
          location.pathname === "/" ? activeItem : inactiveItem
        )}
      >
        Trang chủ
      </Link>

      <Link
        to="/markets"
        className={cn(
          baseItem,
          location.pathname.includes("/markets") ? activeItem : inactiveItem
        )}
      >
        Thị trường
      </Link>

      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter("investment")}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenu open={openDropdown === "investment"}>
          <DropdownMenuTrigger
            className={cn(
              baseItem,
              "flex items-center gap-0.5",
              location.pathname.includes("/investment") ? activeItem : inactiveItem
            )}
            asChild
          >
            <div>
              Đầu tư
              <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-70" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-xl min-w-[200px] border border-gray-100">
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

      <div className="w-px h-5 bg-gray-200 mx-1" aria-hidden />

      <Link
        to="/exchange-rate"
        className={cn(
          baseItem,
          location.pathname.includes("/exchange-rate")
            ? activeItem
            : inactiveItem
        )}
      >
        Giá vàng / ngoại tệ
      </Link>

      <Link
        to="/articles"
        className={cn(
          baseItem,
          location.pathname.includes("/articles") ? activeItem : inactiveItem
        )}
      >
        Bài viết
      </Link>

      <Link
        to="/feedback"
        className={cn(
          baseItem,
          "inline-flex items-center gap-1.5",
          location.pathname.includes("/feedback") ? activeItem : inactiveItem
        )}
      >
        Phản hồi khách hàng
        <Star className="h-3.5 w-3.5 text-gray-400 stroke-[1.5]" />
      </Link>

      {(user?.is_admin || user?.is_vip) && (
        <Link
          to="/stock-insight"
          className={cn(
            baseItem,
            "inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50/80",
            location.pathname.includes("/stock-insight") && "bg-amber-50/80 text-amber-700"
          )}
        >
          TOP cổ phiếu mạnh
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
        </Link>
      )}

      <Link
        to="/chat"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm",
          location.pathname.includes("/chat") && "ring-2 ring-primary/30"
        )}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        Chat AI
      </Link>
    </nav>
  );
};

export default HeaderClient;
