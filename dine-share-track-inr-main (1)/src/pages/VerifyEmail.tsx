import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from '@/lib/SettingsContext';

const VerifyEmail = () => {
  const { confirmSignUpWithCode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSettings } = useSettings();
  
  // Get email from query params or state
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');
  const emailFromState = location.state?.email;
  
  const [username, setUsername] = useState(emailFromQuery || emailFromState || '');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!code) {
      setErrorMessage('Please enter the verification code');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const result = await confirmSignUpWithCode(username, code);
      
      if (result.error) {
        setErrorMessage(result.error.message);
      } else {
        setIsVerified(true);
        toast({
          title: "Email verified successfully",
          description: "Your account has been verified. You can now sign in.",
        });
        
        // Redirect to login page after verification
        setTimeout(() => {
          navigate('/', { state: { verifiedEmail: username } });
        }, 3000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = () => {
    // Code to request new verification code
    toast({
      title: "New code sent",
      description: "Please check your email for a new verification code.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg dark:bg-gray-800 border-none">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-center dark:text-gray-200">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center dark:text-gray-400">
              We sent a verification code to your email address.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {isVerified ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Email Verified Successfully
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your account has been verified. Redirecting to login page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-200">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                
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
                
                <Button 
                  type="submit" 
                  className="w-full dark:text-gray-100" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            )}
          </CardContent>
          
          {!isVerified && (
            <CardFooter className="flex justify-center pt-2">
              <Button 
                variant="link" 
                className="text-sm text-gray-500 dark:text-gray-400"
                onClick={handleResendCode}
              >
                Didn't receive a code? Resend
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail; 