
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { BarChart3, Bell, ChevronLeft, FileText, Image, LayoutDashboard, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Sample notifications data
const sampleNotifications = [
  {
    id: '1',
    title: 'New user registered',
    description: 'A new user has registered on the platform.',
    date: '2 hours ago',
    read: false
  },
  {
    id: '2',
    title: 'Post approved',
    description: 'The article "Market Trends 2023" has been approved.',
    date: '5 hours ago',
    read: false
  },
  {
    id: '3',
    title: 'System update',
    description: 'System will undergo maintenance on Saturday.',
    date: 'Yesterday',
    read: true
  },
  {
    id: '4',
    title: 'New comment',
    description: 'Someone commented on your post.',
    date: '3 days ago',
    read: true
  }
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    navigate(`/admin/notifications/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 z-50 flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-64",
          "hidden md:flex"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn("flex h-16 items-center border-b px-4", 
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2 font-display font-semibold text-primary">
              <LayoutDashboard size={20} />
              <span>Trang quản trị</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="h-8 w-8"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", 
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-3 space-y-1">
            <NavItem icon={LayoutDashboard} label="Trang chủ" to="/admin" collapsed={collapsed} />
            <NavItem icon={Users} label="Quản lí người dùng" to="/admin/users" collapsed={collapsed} />
            <NavItem icon={FileText} label="Quản lí bài viết" to="/admin/posts" collapsed={collapsed} />
            <NavItem icon={Image} label="Quản lí slide" to="/admin/hero-slides" collapsed={collapsed} />
            <NavItem icon={BarChart3} label="Quản lí thống kê" to="/admin/analytics" collapsed={collapsed} />
            <NavItem icon={Bell} label="Quản lí thông báo" to="/admin/notifications" collapsed={collapsed} />
            <NavItem icon={Settings} label="Quản lí cài đặt" to="/admin/settings" collapsed={collapsed} />
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t p-3">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {collapsed ? (
              <LogOut size={18} />
            ) : (
              <>
                <LogOut size={18} />
                <span>Quay về trang chủ</span>
              </>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Header and Menu */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <Link to="/admin" className="flex items-center gap-2 font-display font-semibold text-primary">
          <LayoutDashboard size={20} />
          <span>Trang quản trị</span>
        </Link>
        
        {/* Mobile Notification Icon */}
        <div className="flex items-center gap-2">
          <NotificationDropdown 
            notifications={notifications} 
            unreadCount={unreadCount} 
            markAsRead={markAsRead} 
            onNotificationClick={handleNotificationClick}
          />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu}></div>
          <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link to="/admin" className="flex items-center gap-2 font-display font-semibold text-primary">
                <LayoutDashboard size={20} />
                <span>Trang quản trị</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X size={20} />
              </Button>
            </div>
            <nav className="flex-1 overflow-auto py-4">
              <div className="px-3 space-y-1">
                <NavItem icon={LayoutDashboard} label="Trang chủ" to="/admin" collapsed={false} />
                <NavItem icon={Users} label="Users" to="/admin/users" collapsed={false} />
                <NavItem icon={FileText} label="Quản lí bài viết" to="/admin/posts" collapsed={false} />
                <NavItem icon={Image} label="Quản lí slide" to="/admin/hero-slides" collapsed={false} />
                <NavItem icon={BarChart3} label="Quản lí thống kê" to="/admin/analytics" collapsed={false} />
                <NavItem icon={Bell} label="Quản lí thông báo" to="/admin/notifications" collapsed={false} />
                <NavItem icon={Settings} label="Quản lí cài đặt" to="/admin/settings" collapsed={false} />
              </div>
            </nav>
            <div className="mt-auto border-t p-3">
              <Link 
                to="/" 
                className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut size={18} />
                <span>Quay về trang chủ</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Desktop Header */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        collapsed ? "md:ml-[70px]" : "md:ml-64",
        "mt-16 md:mt-0"
      )}>
        {/* Desktop Header */}
        <div className="hidden md:block border-b bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-4">
              <NotificationDropdown 
                notifications={notifications} 
                unreadCount={unreadCount} 
                markAsRead={markAsRead} 
                onNotificationClick={handleNotificationClick}
              />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div>
              {/* Additional header elements could go here */}
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Notification Dropdown Component
const NotificationDropdown = ({ 
  notifications, 
  unreadCount, 
  markAsRead,
  onNotificationClick
}: { 
  notifications: any[]; 
  unreadCount: number; 
  markAsRead: (id: string) => void; 
  onNotificationClick: (id: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs leading-none text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn(
                  "flex flex-col items-start py-2 px-4 gap-1 cursor-pointer",
                  !notification.read && "bg-slate-50"
                )}
                onClick={() => onNotificationClick(notification.id)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{notification.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
                {!notification.read && (
                  <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    New
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link to="/admin/notifications" className="w-full block">
          <DropdownMenuItem className="cursor-pointer text-center text-primary">
            View all notifications
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Navigation Item Component
const NavItem = ({ 
  icon: Icon, 
  label, 
  to, 
  collapsed 
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string; 
  collapsed: boolean; 
}) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
        collapsed ? "justify-center" : "justify-start"
      )}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

export default AdminLayout;
