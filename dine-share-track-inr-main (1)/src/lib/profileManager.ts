import { UserProfile } from '@/data/types';

export interface ExtendedUserProfile extends UserProfile {
  avatar?: string;
  bio?: string;
  lastUpdated?: number;
  location?: string;
  website?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export class ProfileManager {
  private static getStorageKey(email: string, type: 'profile' | 'avatar' | 'cover') {
    return `user-${type}-${email}`;
  }

  /**
   * Load user profile from localStorage
   */
  static loadProfile(email: string): ExtendedUserProfile | null {
    if (!email) return null;
    
    try {
      const storageKey = this.getStorageKey(email, 'profile');
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const profile = JSON.parse(stored) as ExtendedUserProfile;
        
        // Ensure email is current
        profile.email = email;
        
        // Load avatar separately
        const avatarKey = this.getStorageKey(email, 'avatar');
        const storedAvatar = localStorage.getItem(avatarKey);
        if (storedAvatar) {
          profile.avatar = storedAvatar;
        }
        
        return profile;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    
    return null;
  }

  /**
   * Save user profile to localStorage
   */
  static saveProfile(email: string, profile: ExtendedUserProfile): void {
    if (!email) return;
    
    try {
      const storageKey = this.getStorageKey(email, 'profile');
      const profileToSave = {
        ...profile,
        email,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(profileToSave));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Save user avatar separately
   */
  static saveAvatar(email: string, avatarData: string): void {
    if (!email) return;
    
    try {
      const avatarKey = this.getStorageKey(email, 'avatar');
      localStorage.setItem(avatarKey, avatarData);
    } catch (error) {
      console.error('Error saving avatar:', error);
      throw error;
    }
  }

  /**
   * Load user avatar
   */
  static loadAvatar(email: string): string | null {
    if (!email) return null;
    
    try {
      const avatarKey = this.getStorageKey(email, 'avatar');
      return localStorage.getItem(avatarKey);
    } catch (error) {
      console.error('Error loading avatar:', error);
      return null;
    }
  }

  /**
   * Remove user avatar
   */
  static removeAvatar(email: string): void {
    if (!email) return;
    
    try {
      const avatarKey = this.getStorageKey(email, 'avatar');
      localStorage.removeItem(avatarKey);
    } catch (error) {
      console.error('Error removing avatar:', error);
    }
  }

  /**
   * Create default profile for a user
   */
  static createDefaultProfile(email: string): ExtendedUserProfile {
    return {
      id: crypto.randomUUID(),
      name: 'User',
      email,
      phone: '',
      avatar: undefined,
      bio: '',
      lastUpdated: Date.now(),
      location: '',
      website: '',
      occupation: '',
      education: '',
      interests: [],
      socialLinks: {}
    };
  }

  /**
   * Get or create profile for a user
   */
  static getOrCreateProfile(email: string): ExtendedUserProfile {
    const existingProfile = this.loadProfile(email);
    
    if (existingProfile) {
      return existingProfile;
    }
    
    const newProfile = this.createDefaultProfile(email);
    this.saveProfile(email, newProfile);
    return newProfile;
  }

  /**
   * Clear all data for a specific user
   */
  static clearUserData(email: string): void {
    if (!email) return;
    
    try {
      const profileKey = this.getStorageKey(email, 'profile');
      const avatarKey = this.getStorageKey(email, 'avatar');
      const coverKey = this.getStorageKey(email, 'cover');
      
      localStorage.removeItem(profileKey);
      localStorage.removeItem(avatarKey);
      localStorage.removeItem(coverKey);
      
      // Also clear user notifications
      const notificationKey = `notifications-${email}`;
      localStorage.removeItem(notificationKey);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  /**
   * Delete profile for a specific user (alias for clearUserData)
   */
  static deleteProfile(email: string): void {
    this.clearUserData(email);
  }

  /**
   * Get all user emails that have profiles
   */
  static getAllUserEmails(): string[] {
    const emails: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user-profile-')) {
          const email = key.replace('user-profile-', '');
          if (email) {
            emails.push(email);
          }
        }
      }
    } catch (error) {
      console.error('Error getting user emails:', error);
    }
    
    return emails;
  }

  /**
   * Check if user has a profile
   */
  static hasProfile(email: string): boolean {
    if (!email) return false;
    
    const storageKey = this.getStorageKey(email, 'profile');
    return localStorage.getItem(storageKey) !== null;
  }
} 