import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Define the shape of our settings
interface AppSettings {
  language: string;
  currency: string;
  currencySymbol: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  exportFormat: 'pdf' | 'csv' | 'excel';
  dateFormat: string;
  privacySettings: {
    shareData: boolean;
    storeHistory: boolean;
  };
  colorScheme?: string; // New field for accent color
}

interface AccountSettings {
  email: string;
  password: string;
  twoFactor: boolean;
  connectedDevices: { deviceId: string; name: string }[];
}

const defaultSettings: AppSettings = {
  language: 'en-IN',
  currency: 'INR',
  currencySymbol: '₹',
  darkMode: false,
  notificationsEnabled: true,
  emailNotifications: false,
  pushNotifications: true,
  exportFormat: 'pdf',
  dateFormat: 'DD/MM/YYYY',
  privacySettings: {
    shareData: false,
    storeHistory: true,
  },
  colorScheme: 'blue',
};

const defaultAccountSettings: AccountSettings = {
  email: 'finalui@yandex.com',
  password: '••••••••••••',
  twoFactor: false,
  connectedDevices: [{ deviceId: '1', name: 'Current device' }]
};

// Create the context with sensible defaults
interface SettingsContextType {
  settings: AppSettings;
  accountSettings: AccountSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateAccountSettings: (newSettings: Partial<AccountSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  accountSettings: defaultAccountSettings,
  updateSettings: () => {},
  updateAccountSettings: () => {},
  resetSettings: () => {},
});

// Hook to use the settings context
export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings, refreshSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const [accountSettings, setAccountSettings, refreshAccountSettings] = useLocalStorage<AccountSettings>('account-settings', defaultAccountSettings);
  
  // Apply theme whenever darkMode changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);
  
  // Apply accent color whenever colorScheme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.colorScheme === 'blue') {
      root.style.setProperty('--accent-color', '#2196F3');
    } else if (settings.colorScheme === 'green') {
      root.style.setProperty('--accent-color', '#4CAF50');
    } else if (settings.colorScheme === 'orange') {
      root.style.setProperty('--accent-color', '#FF7E45');
    } else if (settings.colorScheme === 'purple') {
      root.style.setProperty('--accent-color', '#9C27B0');
    }
  }, [settings.colorScheme]);

  // Function to update settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
  };

  // Function to update account settings
  const updateAccountSettings = (newSettings: Partial<AccountSettings>) => {
    const updatedAccountSettings = { ...accountSettings, ...newSettings };
    setAccountSettings(updatedAccountSettings);
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      accountSettings, 
      updateSettings, 
      updateAccountSettings,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { defaultSettings, defaultAccountSettings }; 