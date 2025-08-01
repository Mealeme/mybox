import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, CloudCog, CreditCard, Moon, ReceiptText, Sun, UserCircle2, WalletCards, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated, isLoading, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPasswordField, setShowResetPasswordField] = useState(false);

  // Handle URL parameters for error messages
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error && message) {
      toast({
        title: error,
        description: message,
        variant: "destructive",
      });
      // Clear the URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, toast]);
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Preparing your experience...</p>
      </div>
    );
  }
  
  // If the user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await signUpWithEmail(email, email, password);
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your email address with the code we sent you",
        });
        
        // Save the current email value
        const currentEmail = email;
        
        // Reset form fields after successful signup
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to verification page
        navigate('/verify-email', { state: { email: currentEmail } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await resetPassword(resetPasswordEmail);
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link",
        });
        setShowResetPassword(false);
        setResetPasswordEmail('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
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
      
      {/* Left side - Auth form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center">
        {showResetPassword ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">Reset Password</CardTitle>
                <CardDescription className="text-center dark:text-gray-300">
                  Enter your email to receive a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="dark:text-gray-200">Email</Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={resetPasswordEmail}
                      onChange={(e) => setResetPasswordEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 h-11 mt-2 dark:text-gray-100" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full dark:text-gray-300 dark:hover:bg-gray-700" 
                  onClick={() => setShowResetPassword(false)}
                  disabled={isSubmitting}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="space-y-1 pt-6">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                    <WalletCards className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">MealSync</CardTitle>
                <CardDescription className="text-center dark:text-gray-300">
                  Track, share, and manage meal expenses together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-gray-700">
                    <TabsTrigger value="signin" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs dark:text-primary"
                            onClick={() => setShowResetPassword(true)}
                            type="button"
                            disabled={isSubmitting}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                            type="button"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" /> : <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/90 h-11 dark:text-gray-100" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-signup" className="dark:text-gray-200">Email</Label>
                        <Input 
                          id="email-signup" 
                          type="email" 
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password-signup" className="dark:text-gray-200">Password</Label>
                        <div className="relative">
                          <Input 
                            id="password-signup" 
                            type={showSignupPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            disabled={isSubmitting}
                            type="button"
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" /> : <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                        <div className="relative">
                          <Input 
                            id="confirm-password" 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isSubmitting}
                            type="button"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" /> : <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/90 h-11 dark:text-gray-100" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Right side - Features */}
      <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800/50 dark:to-gray-900/50 hidden md:flex items-center justify-center">
        <motion.div 
          className="max-w-lg space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-bold tracking-tight mb-3 dark:text-gray-100">Simplify your meal expenses</h1>
            <p className="text-muted-foreground text-lg mb-6 dark:text-gray-300">
              Track, share, and manage all your dining expenses in one place.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid gap-6"
            variants={containerVariants}
          >
            {[
              {
                icon: <ReceiptText className="h-5 w-5 text-primary" />,
                title: "Easy Expense Tracking",
                description: "Log and categorize your meal expenses with just a few taps"
              },
              {
                icon: <UserCircle2 className="h-5 w-5 text-primary" />,
                title: "Split Costs Fairly",
                description: "Share expenses with friends and split costs automatically"
              },
              {
                icon: <CreditCard className="h-5 w-5 text-primary" />,
                title: "Budget Management",
                description: "Set budgets and get insights into your spending habits"
              },
              {
                icon: <CloudCog className="h-5 w-5 text-primary" />,
                title: "Cloud Sync",
                description: "Access your expense data from any device, anytime"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="flex items-start space-x-4 p-4 rounded-lg bg-background/80 shadow-sm dark:bg-gray-800/90 dark:border dark:border-gray-700"
              >
                <div className="mt-0.5 bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium dark:text-gray-200">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
