
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Bell, Moon, Globe, Shield, Smartphone, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  }
};

const languages = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'kn-IN', label: 'Kannada' },
  { value: 'ml-IN', label: 'Malayalam' },
];

const currencies = [
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (31-Dec-2025)' },
];

const exportFormats = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'csv', label: 'CSV File' },
  { value: 'excel', label: 'Excel Spreadsheet' },
];

const Settings: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState<AppSettings>({...settings});
  const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local settings when settings from localStorage change
  useEffect(() => {
    setLocalSettings({...settings});
  }, [settings]);
  
  const handleLanguageChange = (value: string) => {
    setLocalSettings(prev => ({ ...prev, language: value }));
  };
  
  const handleCurrencyChange = (value: string) => {
    const selectedCurrency = currencies.find(c => c.value === value);
    if (selectedCurrency) {
      setLocalSettings(prev => ({ 
        ...prev, 
        currency: value,
        currencySymbol: selectedCurrency.symbol
      }));
    }
  };
  
  const handleDateFormatChange = (value: string) => {
    setLocalSettings(prev => ({ ...prev, dateFormat: value }));
  };
  
  const handleExportFormatChange = (value: 'pdf' | 'csv' | 'excel') => {
    setLocalSettings(prev => ({ ...prev, exportFormat: value }));
  };
  
  const handleToggleChange = (key: keyof AppSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleNestedToggleChange = (parent: 'privacySettings', key: string, value: boolean) => {
    setLocalSettings(prev => {
      const updatedPrivacySettings = {
        ...prev.privacySettings,
        [key]: value
      };
      
      return {
        ...prev,
        privacySettings: updatedPrivacySettings
      };
    });
  };
  
  const saveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setSettings(localSettings);
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    }, 500);
  };
  
  const resetToDefaults = () => {
    setLocalSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };
  
  const handleDeleteAllData = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation failed",
        description: "Please type DELETE to confirm data deletion",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate data deletion with a delay
    toast({
      title: "Processing",
      description: "Deleting your data...",
    });
    
    setTimeout(() => {
      // Clear expenses and other app data from localStorage
      localStorage.removeItem('expenses');
      localStorage.removeItem('groups');
      
      setDeleteDataDialogOpen(false);
      setDeleteConfirmText('');
      
      toast({
        title: "Data deleted",
        description: "All your data has been permanently deleted",
        variant: "default",
      });
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Customize your app experience and preferences</p>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-food-blue" />
                  Localization Settings
                </CardTitle>
                <CardDescription>
                  Configure your preferred language, currency and date format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={localSettings.language} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your preferred language for the application
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={localSettings.currency} 
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set the default currency for new expenses
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={localSettings.dateFormat} 
                    onValueChange={handleDateFormatChange}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose how dates are displayed throughout the app
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-food-green" />
                  Export Settings
                </CardTitle>
                <CardDescription>
                  Configure how your data is exported
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Default Export Format</Label>
                  {exportFormats.map(format => (
                    <div key={format.value} className="flex items-center space-x-2 py-1">
                      <input 
                        type="radio"
                        id={`format-${format.value}`}
                        value={format.value}
                        checked={localSettings.exportFormat === format.value}
                        onChange={() => handleExportFormatChange(format.value as 'pdf' | 'csv' | 'excel')}
                        className="cursor-pointer"
                      />
                      <Label 
                        htmlFor={`format-${format.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {format.label}
                      </Label>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Some export formats may require premium features
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-food-blue" />
                  Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="block">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use dark theme for the application
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={localSettings.darkMode}
                    onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-food-orange" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="block">All Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Master toggle for all notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={localSettings.notificationsEnabled}
                    onCheckedChange={(checked) => handleToggleChange('notificationsEnabled', checked)}
                  />
                </div>
                
                <div className="pl-6 border-l-2 border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="block">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={localSettings.emailNotifications}
                      onCheckedChange={(checked) => handleToggleChange('emailNotifications', checked)}
                      disabled={!localSettings.notificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications" className="block">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive real-time push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={localSettings.pushNotifications}
                      onCheckedChange={(checked) => handleToggleChange('pushNotifications', checked)}
                      disabled={!localSettings.notificationsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-food-green" />
                  Mobile App Notifications
                </CardTitle>
                <CardDescription>
                  Configure mobile-specific notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Download our mobile app to configure additional notification settings
                  </p>
                  <Button variant="outline" className="mt-2">
                    Get Mobile App <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-food-blue" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your data is used and stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shareData" className="block">Usage Analytics</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share anonymous usage data to help improve the app
                    </p>
                  </div>
                  <Switch
                    id="shareData"
                    checked={localSettings.privacySettings.shareData}
                    onCheckedChange={(checked) => 
                      handleNestedToggleChange('privacySettings', 'shareData', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="storeHistory" className="block">Store Expense History</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Keep history of all your expenses (recommended)
                    </p>
                  </div>
                  <Switch
                    id="storeHistory"
                    checked={localSettings.privacySettings.storeHistory}
                    onCheckedChange={(checked) => 
                      handleNestedToggleChange('privacySettings', 'storeHistory', checked)
                    }
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteDataDialogOpen(true)}
                  >
                    Delete All My Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This action cannot be undone
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <AlertDialog open={deleteDataDialogOpen} onOpenChange={setDeleteDataDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-500">Delete All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your expenses, groups, and other data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Label htmlFor="confirmDeleteData" className="text-sm font-medium">
                    To confirm, type "DELETE" in the field below
                  </Label>
                  <Input
                    id="confirmDeleteData"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAllData} 
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span> Saving...
              </span>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
