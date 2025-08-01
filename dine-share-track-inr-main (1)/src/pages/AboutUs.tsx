import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Target, Shield, Sparkles, Heart, TrendingUp, Star } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-food-blue via-food-green to-food-orange bg-clip-text text-transparent">
            About MealSync
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Simplifying group expenses and making shared dining experiences more enjoyable.
            We're on a mission to make expense tracking effortless and social.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-40 right-10 -mt-10 -mr-10 w-40 h-40 bg-food-yellow/20 rounded-full blur-3xl dark:bg-food-yellow/10 z-0"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-food-blue/10 rounded-full blur-3xl dark:bg-food-blue/5 z-0"></div>

        {/* Our Story */}
        <Card className="mb-12 relative z-10">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              MealSync was born from a simple observation: sharing meals brings people together, but splitting bills can create awkward moments.
              Founded in 2025 by Nikhil Kadam, we set out to create a solution that would make group expense management seamless and stress-free.
            </p>
            <p>
              What started as a simple expense-splitting app has evolved into a comprehensive platform that helps friends and colleagues
              manage their shared expenses while maintaining transparency and fostering better financial relationships.
            </p>
          </CardContent>
        </Card>

        {/* Leadership */}
        <Card className="mb-12 relative z-10">
          <CardHeader>
            <CardTitle>Leadership</CardTitle>
            <CardDescription>
              Meet the visionary behind MealSync
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-food-orange/20 to-food-blue/20 flex items-center justify-center">
                <Star className="w-24 h-24 text-food-orange/50" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
                Nikhil Kadam
              </h3>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                Founder & CEO
              </p>
              <div className="prose dark:prose-invert">
                <p>
                  As the founder and CEO of MealSync, Nikhil Kadam brings his passion for technology and innovation to solve real-world problems.
                  His vision for MealSync stems from personal experiences with group expenses and a desire to make financial management more
                  accessible and social.
                </p>
                <p>
                  Under his leadership, MealSync has grown from a simple idea into a comprehensive platform that helps thousands of users
                  manage their shared expenses effortlessly. Nikhil's focus on user experience and continuous innovation drives the company's
                  mission to revolutionize how people handle group finances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 relative z-10">
          <Card className="bg-gradient-to-br from-food-blue/10 to-transparent">
            <CardHeader>
              <div className="bg-food-blue/10 p-3 rounded-full w-fit">
                <Users className="h-6 w-6 text-food-blue" />
              </div>
              <CardTitle className="mt-4">User-Centric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Every feature we build starts with our users' needs. We're committed to creating intuitive and helpful solutions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-food-green/10 to-transparent">
            <CardHeader>
              <div className="bg-food-green/10 p-3 rounded-full w-fit">
                <Shield className="h-6 w-6 text-food-green" />
              </div>
              <CardTitle className="mt-4">Trust & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                We prioritize the security of your data and financial information with industry-standard encryption and best practices.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-food-orange/10 to-transparent">
            <CardHeader>
              <div className="bg-food-orange/10 p-3 rounded-full w-fit">
                <Sparkles className="h-6 w-6 text-food-orange" />
              </div>
              <CardTitle className="mt-4">Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                We continuously improve our platform with new features and technologies to provide the best experience possible.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <Card className="mb-12 relative z-10">
          <CardHeader>
            <CardTitle>What Sets Us Apart</CardTitle>
            <CardDescription>
              Features that make MealSync the perfect choice for managing group expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Smart Expense Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Automatically categorize and track expenses with intelligent recognition systems.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Group Management</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create and manage multiple groups for different occasions and social circles.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Real-time Updates</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Stay informed with instant notifications and real-time expense tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">User Experience</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Beautiful, intuitive interface designed for seamless navigation and ease of use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle>Meet Our Team</CardTitle>
            <CardDescription>
              Dedicated professionals working to make your expense sharing experience better
            </CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Our diverse team brings together expertise in finance, technology, and user experience design.
              We're passionate about creating solutions that make financial management more accessible and social.
            </p>
            <p>
              Based in Nashik, India, we're a growing team of innovators committed to revolutionizing how people manage shared expenses.
              We believe in fostering a culture of collaboration, creativity, and continuous improvement.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AboutUs; 