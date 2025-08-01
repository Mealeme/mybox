import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          {/* Header Section - Fixed */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 border-b border-border">
            <div className="text-center py-8">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: May 17, 2025</p>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-accent/20">
              <div 
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div 
            className="h-[calc(100vh-16rem)] overflow-y-auto p-8"
            onScroll={handleScroll}
          >
            {/* Introduction */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <div className="bg-card/50 rounded-lg p-6 border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </div>
            </div>

            {/* Definitions */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Definitions</h2>
              <div className="space-y-4">
                {definitions.map((def, index) => (
                  <div key={index} className="bg-accent/5 p-4 rounded-md">
                    <h3 className="font-semibold text-primary mb-2">{def.term}</h3>
                    <p className="text-muted-foreground">{def.definition}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Collection */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Types of Data Collected</h2>
              <div className="space-y-8">
                {/* Personal Data */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Personal Data</h3>
                  <p className="text-muted-foreground mb-4">
                    While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Usage Data</li>
                  </ul>
                </div>

                {/* Usage Data */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Usage Data</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Usage Data is collected automatically when using the Service.</p>
                    <p>
                      Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                    </p>
                  </div>
                </div>

                {/* Tracking Technologies */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Tracking Technologies and Cookies</h3>
                  <div className="space-y-4">
                    {cookieTypes.map((cookie, index) => (
                      <div key={index} className="bg-accent/5 p-4 rounded-md">
                        <h4 className="font-semibold text-primary mb-2">{cookie.type}</h4>
                        <p className="text-sm text-muted-foreground mb-2">Type: {cookie.cookieType}</p>
                        <p className="text-sm text-muted-foreground mb-2">Administered by: {cookie.administrator}</p>
                        <p className="text-muted-foreground">{cookie.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Use of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Use of Your Personal Data</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">The Company may use Personal Data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                  {dataUsagePurposes.map((purpose, index) => (
                    <li key={index}>{purpose}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Retention of Your Personal Data</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
                </p>
                <p>
                  The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-primary/5 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Contact Us</h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about this Privacy Policy, You can contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <a
                    href="mailto:mealsyncofficial@gmail.com"
                    className="text-primary hover:underline"
                  >
                    mealsyncofficial@gmail.com
                  </a>
                </div>
                <div className="bg-background rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <address className="not-italic text-muted-foreground">
                    MealSync<br />
                    Amrut Garden, Ashok Nagar Nashik<br />
                    422008, Nashik, Maharastra<br />
                    India
                  </address>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Data definitions
const definitions = [
  {
    term: 'Account',
    definition: 'A unique account created for You to access our Service or parts of our Service.'
  },
  {
    term: 'Affiliate',
    definition: 'An entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.'
  },
  {
    term: 'Company',
    definition: 'MealSync (referred to as either "the Company", "We", "Us" or "Our" in this Agreement)'
  },
  {
    term: 'Cookies',
    definition: 'Small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.'
  },
  {
    term: 'Country',
    definition: 'Maharashtra, India'
  },
  {
    term: 'Device',
    definition: 'Any device that can access the Service such as a computer, a cellphone or a digital tablet.'
  },
  {
    term: 'Personal Data',
    definition: 'Any information that relates to an identified or identifiable individual.'
  },
  {
    term: 'Service',
    definition: 'The Website accessible from https://mealsync.me/'
  }
];

const cookieTypes = [
  {
    type: 'Necessary / Essential Cookies',
    cookieType: 'Session Cookies',
    administrator: 'Us',
    purpose: 'These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. Without these Cookies, the services that You have asked for cannot be provided.'
  },
  {
    type: 'Cookies Policy / Notice Acceptance Cookies',
    cookieType: 'Persistent Cookies',
    administrator: 'Us',
    purpose: 'These Cookies identify if users have accepted the use of cookies on the Website.'
  },
  {
    type: 'Functionality Cookies',
    cookieType: 'Persistent Cookies',
    administrator: 'Us',
    purpose: 'These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference.'
  }
];

const dataUsagePurposes = [
  'To provide and maintain our Service, including to monitor the usage of our Service.',
  'To manage Your Account: to manage Your registration as a user of the Service.',
  'For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.',
  'To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication.',
  'To provide You with news, special offers and general information about other goods, services and events.',
  'To manage Your requests: To attend and manage Your requests to Us.',
  'For business transfers: We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.',
  'For other purposes: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns.'
];

export default PrivacyPolicy; 