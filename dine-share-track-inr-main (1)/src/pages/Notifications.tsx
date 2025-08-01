import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { useNotifications } from '@/lib/NotificationsContext';
import type { Notification as AppNotification } from '@/lib/NotificationsContext';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllRead,
    addNotification 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Request notification permission on component mount if needed
  useEffect(() => {
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  const filteredNotifications = notifications.filter(n => {
    // Filter by read status
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    
    // Filter by category
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    
    return true;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'expense', label: 'Expenses' },
    { id: 'payment', label: 'Payments' },
    { id: 'group', label: 'Groups' },
    { id: 'system', label: 'System' }
  ];

  // Function to create a test notification (for demo purposes)
  const createTestNotification = () => {
    const testTypes = [
      { 
        category: 'expense' as const, 
        title: 'Test expense notification', 
        message: 'This is a test expense notification' 
      },
      { 
        category: 'payment' as const, 
        title: 'Test payment notification', 
        message: 'This is a test payment notification' 
      },
      { 
        category: 'group' as const, 
        title: 'Test group notification', 
        message: 'This is a test group notification' 
      },
      { 
        category: 'system' as const, 
        title: 'Test system notification', 
        message: 'This is a test system notification' 
      }
    ];
    
    const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
    
    addNotification({
      ...randomType,
      read: false
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Bell className="h-6 w-6 mr-3 text-food-orange" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {/* Test button for demo purposes */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={createTestNotification}
            >
              Test Notification
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all as read
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={deleteAllRead}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete read
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm mb-2">Status:</p>
              <Tabs defaultValue="all" value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div>
              <p className="text-sm mb-2">Category:</p>
              <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList>
                  {categories.map(category => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {filteredNotifications.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`p-4 ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                >
                  <div className="flex justify-between">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-800 dark:text-gray-200' : 'text-black dark:text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <div className="flex mt-3 space-x-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs flex items-center hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-xs flex items-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No notifications found</p>
              {(filter !== 'all' || categoryFilter !== 'all') && (
                <p className="mt-2 text-sm">Try changing your filters</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications; 