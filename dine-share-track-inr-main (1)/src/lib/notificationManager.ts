import { Notification } from './NotificationsContext';

export class NotificationManager {
  private static getStorageKey(email: string) {
    return `notifications-${email}`;
  }

  /**
   * Load notifications for a specific user
   */
  static loadNotifications(email: string): Notification[] {
    if (!email) return [];
    
    try {
      const storageKey = this.getStorageKey(email);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const notifications = JSON.parse(stored) as Notification[];
        // Filter to only show notifications for this user
        return notifications.filter(n => 
          !n.userEmail || n.userEmail === email
        );
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    
    return [];
  }

  /**
   * Save notifications for a specific user
   */
  static saveNotifications(email: string, notifications: Notification[]): void {
    if (!email) return;
    
    try {
      const storageKey = this.getStorageKey(email);
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
      throw error;
    }
  }

  /**
   * Add a notification for a specific user
   */
  static addNotification(email: string, notification: Omit<Notification, 'id' | 'timestamp'>): Notification {
    if (!email) {
      throw new Error('Email is required to add notification');
    }
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userEmail: email,
    };
    
    const currentNotifications = this.loadNotifications(email);
    const updatedNotifications = [newNotification, ...currentNotifications];
    this.saveNotifications(email, updatedNotifications);
    
    return newNotification;
  }

  /**
   * Mark a notification as read for a specific user
   */
  static markAsRead(email: string, notificationId: string): void {
    if (!email) return;
    
    const notifications = this.loadNotifications(email);
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications(email, updatedNotifications);
  }

  /**
   * Mark all notifications as read for a specific user
   */
  static markAllAsRead(email: string): void {
    if (!email) return;
    
    const notifications = this.loadNotifications(email);
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications(email, updatedNotifications);
  }

  /**
   * Delete a notification for a specific user
   */
  static deleteNotification(email: string, notificationId: string): void {
    if (!email) return;
    
    const notifications = this.loadNotifications(email);
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(email, updatedNotifications);
  }

  /**
   * Delete all read notifications for a specific user
   */
  static deleteAllRead(email: string): void {
    if (!email) return;
    
    const notifications = this.loadNotifications(email);
    const updatedNotifications = notifications.filter(n => !n.read);
    this.saveNotifications(email, updatedNotifications);
  }

  /**
   * Get unread count for a specific user
   */
  static getUnreadCount(email: string): number {
    if (!email) return 0;
    
    const notifications = this.loadNotifications(email);
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Clear all notifications for a specific user
   */
  static clearUserNotifications(email: string): void {
    if (!email) return;
    
    try {
      const storageKey = this.getStorageKey(email);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing user notifications:', error);
    }
  }

  /**
   * Get all user emails that have notifications
   */
  static getAllUserEmails(): string[] {
    const emails: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('notifications-')) {
          const email = key.replace('notifications-', '');
          if (email) {
            emails.push(email);
          }
        }
      }
    } catch (error) {
      console.error('Error getting user emails with notifications:', error);
    }
    
    return emails;
  }

  /**
   * Check if user has notifications
   */
  static hasNotifications(email: string): boolean {
    if (!email) return false;
    
    const storageKey = this.getStorageKey(email);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Migrate old global notifications to user-specific storage
   */
  static migrateOldNotifications(email: string): void {
    if (!email) return;
    
    try {
      // Check if old global notifications exist
      const oldNotifications = localStorage.getItem('notifications');
      if (oldNotifications) {
        const parsedNotifications = JSON.parse(oldNotifications) as Notification[];
        
        // Convert old notifications to user-specific format
        const userNotifications = parsedNotifications.map(n => ({
          ...n,
          userEmail: email
        }));
        
        // Save to user-specific storage
        this.saveNotifications(email, userNotifications);
        
        // Remove old global storage
        localStorage.removeItem('notifications');
        
        console.log('Migrated old notifications to user-specific storage');
      }
    } catch (error) {
      console.error('Error migrating old notifications:', error);
    }
  }
} 