
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for dashboard
const sampleData = [
  { name: 'Jan', views: 400, visitors: 240 },
  { name: 'Feb', views: 300, visitors: 139 },
  { name: 'Mar', views: 200, visitors: 980 },
  { name: 'Apr', views: 278, visitors: 390 },
  { name: 'May', views: 189, visitors: 480 },
  { name: 'Jun', views: 239, visitors: 380 },
  { name: 'Jul', views: 349, visitors: 430 },
];

const chartConfig = {
  views: {
    label: "Views",
    theme: {
      light: "#8b5cf6", // purple
      dark: "#a78bfa"  // lighter purple for dark mode
    },
  },
  visitors: {
    label: "Visitors",
    theme: {
      light: "#0ea5e9", // blue
      dark: "#38bdf8"   // lighter blue for dark mode
    }
  }
};

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your site statistics and content</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline">
              <Link to="/">
                View Site
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/posts/create">
                <FileText className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Users" 
            value="3,721" 
            change="+12%" 
            icon={Users} 
            trend="up" 
          />
          <StatCard 
            title="Total Posts" 
            value="254" 
            change="+8%" 
            icon={FileText} 
            trend="up" 
          />
          <StatCard 
            title="Page Views" 
            value="145.8K" 
            change="+24%" 
            icon={BarChart3} 
            trend="up" 
          />
          <StatCard 
            title="Conversion Rate" 
            value="3.42%" 
            change="-2%" 
            icon={TrendingUp} 
            trend="down" 
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Site traffic performance for the last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" name="Views" fill="var(--color-views)" />
                  <Bar dataKey="visitors" name="Visitors" fill="var(--color-visitors)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">New user registered</p>
                      <p className="text-sm text-muted-foreground">User{i}@example.com</p>
                      <p className="text-xs text-muted-foreground">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ElementType; 
  trend: 'up' | 'down'; 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          trend === 'up' ? 'text-green-500' : 'text-red-500'
        } flex items-center gap-0.5 mt-1`}>
          {change}
          <span className="text-xs">from last month</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
