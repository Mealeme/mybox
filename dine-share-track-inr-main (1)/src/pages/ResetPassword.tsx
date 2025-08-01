import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from '@/lib/SettingsContext';

const ResetPassword = () => {
  const { resetPassword, confirmPasswordReset } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setErrorMessage('Please enter your username or email');
          return;
        }
        
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const result = await resetPassword(username);
      
      if (result.error) {
        setErrorMessage(result.error.message);
      } else {
        setResetRequested(true);
        toast({
          title: "Code sent",
          description: "Check your email for the verification code",
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      setErrorMessage('Please enter the verification code');
      return;
    }
    
    if (!password) {
      setErrorMessage('Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const result = await confirmPasswordReset(username, code, password);
      
      if (result.error) {
        setErrorMessage(result.error.message);
        } else {
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now sign in with your new password.",
        });
        
        // Redirect to login page after reset
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
    return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Theme toggle button (fixed position) */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-full bg-white/10 backdrop-blur-sm shadow-md dark:bg-black/20"
          onClick={toggleDarkMode}
        >
          {settings.darkMode ? 
            <Sun className="h-5 w-5 text-yellow-400" /> : 
            <Moon className="h-5 w-5 text-gray-800" />
          }
        </Button>
      </div>
      
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Reset Password</CardTitle>
          <CardDescription className="dark:text-gray-300">
            {resetRequested 
              ? "Enter the verification code sent to your email and create a new password" 
              : "Request a password reset link to your email"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 dark:bg-red-900/30 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="dark:text-red-300">Error</AlertTitle>
              <AlertDescription className="dark:text-red-300">{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {!resetRequested ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-gray-200">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full dark:text-gray-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password" className="dark:text-gray-200">New Password</Label>
                <Input 
                  id="new-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full dark:text-gray-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="dark:text-primary"
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword; 