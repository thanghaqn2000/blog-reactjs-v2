
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Calendar, Check, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample notification data - in a real app, this would come from an API
const sampleNotifications = [
  {
    id: '1',
    title: 'New user registered',
    description: 'A new user has registered on the platform.',
    date: '2 hours ago',
    read: false,
    type: 'user',
    details: 'John Smith (john@example.com) has registered a new account on June 10, 2023. The user has verified their email address and completed their profile information.'
  },
  {
    id: '2',
    title: 'Post approved',
    description: 'The article "Market Trends 2023" has been approved.',
    date: '5 hours ago',
    read: false,
    type: 'content',
    details: 'The article "Market Trends 2023" submitted by editor Sarah Johnson has been approved by moderator Mark Wilson. It has been published and is now visible on the website.'
  },
  {
    id: '3',
    title: 'System update',
    description: 'System will undergo maintenance on Saturday.',
    date: 'Yesterday',
    read: true,
    type: 'system',
    details: 'The system will undergo scheduled maintenance on Saturday, June 15, 2023, from 2:00 AM to 4:00 AM UTC. During this time, the website may be unavailable. The maintenance is being performed to upgrade the database and improve system performance.'
  },
  {
    id: '4',
    title: 'New comment',
    description: 'Someone commented on your post.',
    date: '3 days ago',
    read: true,
    type: 'engagement',
    details: 'A user named Michael Brown has left a comment on your article "Cryptocurrency: The Future of Finance". The comment reads: "Great article! I especially enjoyed the section about blockchain technology."'
  },
  {
    id: '5',
    title: 'Post rejected',
    description: 'The article "Crypto Trends" has been rejected.',
    date: '4 days ago',
    read: true,
    type: 'content',
    details: 'The article "Crypto Trends" submitted by contributor Alex Thompson has been rejected. Reason: The content does not meet our editorial guidelines. Please review and provide more data-driven insights and analysis.'
  }
];

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

const NotificationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const notification = sampleNotifications.find(n => n.id === id);
  
  if (!notification) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Notification not found</h2>
          <p className="text-muted-foreground mt-2">
            The notification you're looking for doesn't exist or has been deleted.
          </p>
          <Button 
            className="mt-6"
            onClick={() => navigate('/admin/notifications')}
          >
            Back to Notifications
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/notifications')}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Notifications</span>
          </Button>
          
          <Badge className={cn("ml-2 font-medium", getTypeColor(notification.type))}>
            {notification.type}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{notification.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {notification.date}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">{notification.description}</p>
            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm">{notification.details}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => navigate('/admin/notifications')}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => {
                  // Mark as read logic would go here
                  navigate('/admin/notifications');
                }}
              >
                <Check size={16} />
                <span>Mark as read</span>
              </Button>
              <Button 
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => {
                  // Delete notification logic would go here
                  navigate('/admin/notifications');
                }}
              >
                <Trash size={16} />
                <span>Delete</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NotificationDetail;
