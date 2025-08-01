import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Phone, Mail, Send, Clock, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContactUs: React.FC = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-food-blue via-food-green to-food-orange bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you. 
            Our team is always ready to assist you.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-40 right-10 -mt-10 -mr-10 w-40 h-40 bg-food-yellow/20 rounded-full blur-3xl dark:bg-food-yellow/10 z-0"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-food-blue/10 rounded-full blur-3xl dark:bg-food-blue/5 z-0"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Here's how you can reach us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-food-green/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-food-green" />
                  </div>
                  <div>
                    <h3 className="font-medium">Our Location</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Amrut Garden, Ashok Nagar<br />
                      Nashik, 422008, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-food-blue/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-food-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone Number</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      +91 8805231821
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Monday to Friday, 9am to 6pm IST
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-food-orange/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-food-orange" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Address</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      mealsyncofficial@gmail.com
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      We usually respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Working Hours</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-food-blue/10 to-food-green/10 border-none">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">How do I create a new group?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    You can create a new group from the Groups page by clicking on the "Create Group" button.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">How do I split expenses?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    When adding an expense, you can select "Split" option and choose how to divide the cost among group members.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Is my data secure?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Yes, we use industry-standard encryption to protect your data and financial information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Thank You!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your message has been sent successfully. We'll get back to you soon.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select 
                        value={formState.subject} 
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        placeholder="How can we help you?"
                        value={formState.message}
                        onChange={handleChange}
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-food-blue to-food-green hover:from-food-blue/90 hover:to-food-green/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Google Map or Location Section */}
        <div className="mt-16 relative z-10">
          <Card className="overflow-hidden">
            <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 relative">
              {/* For real implementation, replace this with an actual Google Map */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.689919675436!2d73.76693521467979!3d19.986371886586245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb2e2e1fdd77%3A0xfee4cca8f21cbf84!2sAmrut%20Garden%2C%20Ashok%20Nagar%2C%20Mumbai%20Naka%2C%20Nashik%2C%20Maharashtra%20422001!5e0!3m2!1sen!2sin!4v1658762856402!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen={false}
                aria-hidden="false"
                tabIndex={0}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs; 