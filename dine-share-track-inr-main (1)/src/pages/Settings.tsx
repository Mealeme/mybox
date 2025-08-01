import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Bell, Moon, Globe, Shield, Smartphone, ChevronRight, 
  ChevronLeft, Pencil, Palette, Sliders, User, LockKeyhole, Brush, 
  Check, Languages, CircleDollarSign, CalendarDays, Save
} from 'lucide-react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings, defaultSettings } from '@/lib/SettingsContext';
import '../lib/settings-variables.css';

// Theme options for the appearance tab
const themeOptions = [
  { id: 'light', name: 'Light', description: 'Clean, bright interface' },
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes, perfect for night' },
  { id: 'system', name: 'System', description: 'Follows your device settings' },
];

const colorSchemes = [
  { id: 'blue', name: 'Default Blue', color: '#2196F3' },
  { id: 'green', name: 'Fresh Green', color: '#4CAF50' },
  { id: 'orange', name: 'Vibrant Orange', color: '#FF7E45' },
  { id: 'purple', name: 'Royal Purple', color: '#9C27B0' },
];

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
  const { settings, accountSettings, updateSettings, updateAccountSettings, resetSettings } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [localSettings, setLocalSettings] = useState({...settings});
  const [localAccountSettings, setLocalAccountSettings] = useState({...accountSettings});
  const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(settings.darkMode ? 'dark' : 'light');
  const [selectedColorScheme, setSelectedColorScheme] = useState(settings.colorScheme || 'blue');
  const [compactMode, setCompactMode] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);
  
  // Determine which tab should be active based on the URL
  const getDefaultTab = () => {
    if (location.pathname.includes('/settings/account')) {
      return 'account';
    }
    return 'general';
  };
  
  // Update local settings when settings from context change
  useEffect(() => {
    setLocalSettings({...settings});
    setLocalAccountSettings({...accountSettings});
    setSelectedTheme(settings.darkMode ? 'dark' : 'light');
    setSelectedColorScheme(settings.colorScheme || 'blue');
  }, [settings, accountSettings]);
  
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
  
  const handleToggleChange = (key: keyof typeof localSettings, value: boolean) => {
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
    
    // Apply theme mode
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    
    // Apply color scheme
    document.documentElement.setAttribute('data-color-scheme', selectedColorScheme);
    
    // Apply compact mode
    document.documentElement.setAttribute('data-compact', compactMode.toString());
    
    // Apply animations setting
    document.documentElement.setAttribute('data-animation', enableAnimations.toString());
    
    setTimeout(() => {
      // Update settings with theme and color choices
      const updatedSettings = {
        ...localSettings,
        darkMode: selectedTheme === 'dark',
        colorScheme: selectedColorScheme
      };
      
      updateSettings(updatedSettings);
      updateAccountSettings(localAccountSettings);
      
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    }, 500);
  };
  
  const handleResetToDefaults = () => {
    setLocalSettings(defaultSettings);
    setSelectedTheme(defaultSettings.darkMode ? 'dark' : 'light');
    setSelectedColorScheme(defaultSettings.colorScheme || 'blue');
    setCompactMode(false);
    setEnableAnimations(true);
    
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

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setSelectedColorScheme(scheme);
    
    // Preview the color scheme immediately
    document.documentElement.setAttribute('data-color-scheme', scheme);
  };
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <Sliders className="h-7 w-7 text-food-blue" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your app experience and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              className="hover:bg-slate-100"
            >
              Reset to Defaults
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isSaving}
              className="bg-food-blue hover:bg-food-blue/90 flex items-center gap-1"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-1">
        <Tabs defaultValue={getDefaultTab()} className="w-full">
            <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2 p-1 h-auto">
              <TabsTrigger value="general" className="flex items-center gap-1.5 py-2.5">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1.5 py-2.5">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1.5 py-2.5">
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1.5 py-2.5">
                <Palette className="h-4 w-4" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1.5 py-2.5">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Privacy & Data</span>
              </TabsTrigger>
          </TabsList>
          
            <div className="px-2 pb-6">
              <TabsContent value="general" className="space-y-6 animate-fade-in">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-food-blue" />
                  Localization Settings
                </CardTitle>
                <CardDescription>
                  Configure your preferred language, currency and date format
                </CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-food-blue" />
                  <Label htmlFor="language">Language</Label>
                        </div>
                  <Select 
                    value={localSettings.language} 
                    onValueChange={handleLanguageChange}
                  >
                          <SelectTrigger id="language" className="w-full">
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
                
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4 text-food-green" />
                  <Label htmlFor="currency">Currency</Label>
                        </div>
                  <Select 
                    value={localSettings.currency} 
                    onValueChange={handleCurrencyChange}
                  >
                          <SelectTrigger id="currency" className="w-full">
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
                </div>
                
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-food-orange" />
                  <Label htmlFor="dateFormat">Date Format</Label>
                        </div>
                  <Select 
                    value={localSettings.dateFormat} 
                    onValueChange={handleDateFormatChange}
                  >
                          <SelectTrigger id="dateFormat" className="w-full">
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
                </div>
              </CardContent>
            </Card>
            
                <Card className="overflow-hidden border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-food-green" />
                  Export Settings
                </CardTitle>
                <CardDescription>
                  Configure how your data is exported
                </CardDescription>
              </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-3 pt-0">
                  {exportFormats.map(format => (
                      <div 
                        key={format.value} 
                        className={`border rounded-lg p-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                          localSettings.exportFormat === format.value ? 
                          'border-food-blue/50 bg-blue-50/50 ring-1 ring-food-blue/20' : 
                          'border-slate-200'
                        }`}
                        onClick={() => handleExportFormatChange(format.value as 'pdf' | 'csv' | 'excel')}
                      >
                        <div className="flex-shrink-0 h-4 w-4 mt-0.5 rounded-full border border-food-blue flex items-center justify-center">
                          {localSettings.exportFormat === format.value && (
                            <div className="h-2 w-2 rounded-full bg-food-blue" />
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor={`format-${format.value}`}
                            className="font-medium cursor-pointer block mb-1"
                      >
                        {format.label}
                      </Label>
                          <p className="text-xs text-muted-foreground">
                            Export your data as {format.label.toLowerCase()}
                  </p>
                </div>
                  </div>
                    ))}
              </CardContent>
            </Card>
          </TabsContent>
          
              <TabsContent value="account" className="space-y-6 animate-fade-in">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-food-blue" />
                      Account Settings
                </CardTitle>
                    <CardDescription>
                      Manage your account login and security settings
                    </CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 bg-slate-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                          <Label htmlFor="email" className="text-sm font-medium">Login email</Label>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input 
                    id="email" 
                    value={localAccountSettings.email} 
                    onChange={(e) => setLocalAccountSettings({...localAccountSettings, email: e.target.value})}
                          className="bg-white border-slate-200"
                  />
                </div>
                
                      <div className="space-y-2 bg-slate-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={localAccountSettings.password} 
                    onChange={(e) => setLocalAccountSettings({...localAccountSettings, password: e.target.value})}
                          className="bg-white border-slate-200"
                    disabled
                  />
                      </div>
                </div>
                
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Two step verification</Label>
                            <p className="text-xs text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                  </div>
                  <Switch 
                    checked={localAccountSettings.twoFactor}
                    onCheckedChange={(checked) => 
                      setLocalAccountSettings({...localAccountSettings, twoFactor: checked})
                    }
                  />
                        </div>
                </div>
                
                      <div className="bg-slate-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Connected devices</Label>
                            <p className="text-xs text-muted-foreground">
                              {localAccountSettings.connectedDevices.length} device connected
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            Manage <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                        className="w-full text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => setDeleteDataDialogOpen(true)}
                  >
                    Delete my account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
              <TabsContent value="notifications" className="space-y-6 animate-fade-in">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-food-orange" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="notifications" className="text-sm font-medium">All Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                      Master toggle for all notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={localSettings.notificationsEnabled}
                    onCheckedChange={(checked) => handleToggleChange('notificationsEnabled', checked)}
                  />
                      </div>
                </div>
                
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={`bg-slate-50 rounded-lg p-4 border transition-opacity ${!localSettings.notificationsEnabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">
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
                  </div>
                  
                      <div className={`bg-slate-50 rounded-lg p-4 border transition-opacity ${!localSettings.notificationsEnabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</Label>
                            <p className="text-xs text-muted-foreground">
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
                    </div>
                    
                    <Card className="bg-gradient-to-br from-food-blue/5 to-food-green/5 border-none overflow-hidden shadow-sm">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-food-green" />
                  Mobile App Notifications
                </CardTitle>
              </CardHeader>
                      <CardContent className="pb-6">
                        <div className="text-center py-4">
                          <p className="text-sm mb-4">
                    Download our mobile app to configure additional notification settings
                  </p>
                          <Button 
                            variant="outline" 
                            className="bg-white hover:bg-slate-50"
                          >
                    Get Mobile App <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                      </CardContent>
                    </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
              <TabsContent value="appearance" className="animate-fade-in">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-food-blue" />
                      Theme Settings
                    </CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Theme Mode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {themeOptions.map(theme => (
                          <div 
                            key={theme.id} 
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                              selectedTheme === theme.id ? 
                              'border-food-blue/50 bg-blue-50/50 ring-1 ring-food-blue/20' : 
                              'border-slate-200'
                            }`}
                            onClick={() => handleThemeChange(theme.id)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{theme.name}</span>
                              {selectedTheme === theme.id && (
                                <Check className="h-4 w-4 text-food-blue" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{theme.description}</p>
                            
                            <div className={`w-full h-10 mt-3 rounded-md ${
                              theme.id === 'dark' ? 'bg-slate-800' : 
                              theme.id === 'light' ? 'bg-slate-100 border border-slate-200' : 
                              'bg-gradient-to-r from-slate-100 to-slate-800 border border-slate-200'
                            }`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-3">Accent Color</h3>
                      <div className="flex flex-wrap gap-3">
                        {colorSchemes.map(scheme => (
                          <div 
                            key={scheme.id}
                            className={`relative rounded-full w-10 h-10 cursor-pointer transition-transform ${
                              selectedColorScheme === scheme.id ? 
                              'ring-2 ring-offset-2 ring-slate-950 scale-110' : ''
                            }`}
                            style={{ backgroundColor: scheme.color }}
                            onClick={() => handleColorSchemeChange(scheme.id)}
                          >
                            {selectedColorScheme === scheme.id && (
                              <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Select an accent color for buttons and interactive elements
                      </p>
                    </div>
                    
                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Compact Mode</Label>
                          <p className="text-xs text-muted-foreground">
                            Reduce padding and spacing throughout the app
                          </p>
                        </div>
                        <Switch 
                          checked={compactMode}
                          onCheckedChange={setCompactMode}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Enable Animations</Label>
                          <p className="text-xs text-muted-foreground">
                            Show animations for transitions and interactions
                          </p>
                        </div>
                        <Switch 
                          checked={enableAnimations}
                          onCheckedChange={setEnableAnimations}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Card className="bg-gradient-to-br from-food-blue/5 to-food-green/5 overflow-hidden border-none shadow-sm">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Font Settings</CardTitle>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">Premium</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Customize text size and font family for better readability
                          </p>
                          <Button variant="outline" className="bg-white hover:bg-slate-50">
                            Upgrade to Premium
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>
          
              <TabsContent value="privacy" className="space-y-6 animate-fade-in">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-food-blue" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your data is used and stored
                </CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="shareData" className="text-sm font-medium">Usage Analytics</Label>
                            <p className="text-xs text-muted-foreground">
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
                </div>
                
                      <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="storeHistory" className="text-sm font-medium">Store Expense History</Label>
                            <p className="text-xs text-muted-foreground">
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
                      </div>
                </div>
                
                    <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100 shadow-sm overflow-hidden">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-red-600/80 mb-4">
                          These actions are permanent and cannot be undone. Please proceed with caution.
                        </p>
                  <Button 
                    variant="outline" 
                          className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 bg-white"
                    onClick={() => setDeleteDataDialogOpen(true)}
                  >
                    Delete All My Data
                  </Button>
                      </CardContent>
                    </Card>
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
            </div>
        </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
