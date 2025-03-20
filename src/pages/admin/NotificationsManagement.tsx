import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Check, Bell, BellOff, Info, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const sampleNotifications = [
  {
    id: '1',
    title: 'New user registered',
    description: 'A new user has registered on the platform.',
    date: '2 hours ago',
    read: false,
    type: 'user'
  },
  {
    id: '2',
    title: 'Post approved',
    description: 'The article "Market Trends 2023" has been approved.',
    date: '5 hours ago',
    read: false,
    type: 'content'
  },
  {
    id: '3',
    title: 'System update',
    description: 'System will undergo maintenance on Saturday.',
    date: 'Yesterday',
    read: true,
    type: 'system'
  },
  {
    id: '4',
    title: 'New comment',
    description: 'Someone commented on your post.',
    date: '3 days ago',
    read: true,
    type: 'engagement'
  },
  {
    id: '5',
    title: 'Post rejected',
    description: 'The article "Crypto Trends" has been rejected.',
    date: '4 days ago',
    read: true,
    type: 'content'
  }
];

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [currentFilter, setCurrentFilter] = useState('all');
  const navigate = useNavigate();

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'unread') return !notification.read;
    if (currentFilter === 'read') return notification.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({...notification, read: true})));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    navigate(`/admin/notifications/${id}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'content':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-red-100 text-red-800';
      case 'engagement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Manage and view all system notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="flex items-center gap-1"
            >
              <Check size={16} />
              <span>Mark all as read</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllNotifications}
              className="flex items-center gap-1"
            >
              <Trash size={16} />
              <span>Clear all</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              You have {notifications.filter(n => !n.read).length} unread notifications
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              {filters.map(filter => (
                <Button
                  key={filter.value}
                  variant={currentFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BellOff className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentFilter === 'all' 
                    ? "You don't have any notifications yet." 
                    : `You don't have any ${currentFilter} notifications.`}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow 
                      key={notification.id}
                      className={cn(!notification.read && "bg-slate-50")}
                    >
                      <TableCell>
                        {!notification.read ? (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        ) : null}
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        {notification.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {notification.description}
                      </TableCell>
                      <TableCell>{notification.date}</TableCell>
                      <TableCell>
                        <Badge className={cn("font-medium", getTypeColor(notification.type))}>
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleNotificationClick(notification.id)}
                            title="View details"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {filteredNotifications.length > 0 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NotificationsManagement;
