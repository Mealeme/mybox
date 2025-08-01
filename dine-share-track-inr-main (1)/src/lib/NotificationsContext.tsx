import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';
import { NotificationManager } from './notificationManager';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'expense' | 'payment' | 'group' | 'system';
  userEmail?: string; // Add user email to track ownership
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications from localStorage on initial render or when user changes
  useEffect(() => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }
    
    try {
      // Migrate old notifications if needed
      NotificationManager.migrateOldNotifications(userEmail);
      
      // Load user-specific notifications
      const userNotifications = NotificationManager.loadNotifications(userEmail);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  }, [userEmail]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    if (!userEmail) return;
    
    try {
      NotificationManager.markAsRead(userEmail, id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = () => {
    if (!userEmail) return;
    
    try {
      NotificationManager.markAllAsRead(userEmail);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const deleteNotification = (id: string) => {
    if (!userEmail) return;
    
    try {
      NotificationManager.deleteNotification(userEmail, id);
      setNotifications(prev => 
        prev.filter(n => n.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const deleteAllRead = () => {
    if (!userEmail) return;
    
    try {
      NotificationManager.deleteAllRead(userEmail);
      setNotifications(prev => 
        prev.filter(n => !n.read)
      );
    } catch (error) {
      console.error('Error deleting all read notifications:', error);
    }
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!userEmail) return;
    
    try {
      const newNotification = NotificationManager.addNotification(userEmail, notification);
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(newNotification.title, {
          body: newNotification.message
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    addNotification
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}; 