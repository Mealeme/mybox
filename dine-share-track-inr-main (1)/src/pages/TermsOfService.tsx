import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: totalHeight * percentage,
      behavior: 'smooth'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          {/* Header Section - Fixed */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 border-b border-border">
            <div className="text-center py-8">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Terms of Service</h1>
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
            {/* Agreement Section */}
            <section className="bg-card rounded-lg p-6 mb-8 border border-border">
              <h2 className="text-2xl font-bold text-primary mb-4">AGREEMENT TO OUR LEGAL TERMS</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We are MealSync ("Company," "we," "us," "our"), a company registered in India at Amrut Garden, Ashok Nagar Nashik, 422008, Nashik, Maharastra 422008.
                </p>
                <div className="bg-accent/5 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <p>Email: <a href="mailto:mealsyncofficial@gmail.com" className="text-primary hover:underline">mealsyncofficial@gmail.com</a></p>
                  <p>Address: Amrut Garden, Ashok Nagar Nashik, 422008, Nashik, Maharastra 422008, India</p>
                </div>
              </div>
            </section>

            {/* Content Sections */}
            {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
              <section
                key={num}
                className="bg-card rounded-lg p-6 mb-8 border border-border"
              >
                <h2 className="text-2xl font-bold text-primary mb-4">
                  {num}. {getSection(num)}
                </h2>
                <div className="space-y-4">
                  {getSectionContent(num)}
                </div>
              </section>
            ))}

            {/* Contact Section */}
            <section className="bg-primary/5 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Need Help?</h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
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

// Helper function to get section titles
const getSection = (num: number): string => {
  const sections: { [key: number]: string } = {
    1: 'OUR SERVICES',
    2: 'INTELLECTUAL PROPERTY RIGHTS',
    3: 'USER REPRESENTATIONS',
    4: 'USER REGISTRATION',
    5: 'SUBSCRIPTIONS',
    6: 'PROHIBITED ACTIVITIES',
    7: 'USER GENERATED CONTRIBUTIONS',
    8: 'CONTRIBUTION LICENSE',
    9: 'SOCIAL MEDIA',
    10: 'THIRD-PARTY WEBSITES AND CONTENT',
    11: 'ADVERTISERS',
    12: 'SERVICES MANAGEMENT',
    13: 'PRIVACY POLICY',
    14: 'TERM AND TERMINATION',
    15: 'MODIFICATIONS AND INTERRUPTIONS',
    16: 'GOVERNING LAW',
    17: 'DISPUTE RESOLUTION',
    18: 'CORRECTIONS',
    19: 'DISCLAIMER',
    20: 'LIMITATIONS OF LIABILITY',
    21: 'INDEMNIFICATION',
    22: 'USER DATA',
    23: 'ELECTRONIC COMMUNICATIONS',
    24: 'MISCELLANEOUS',
    25: 'CONTACT US'
  };
  return sections[num] || '';
};

// Helper function to get section content
const getSectionContent = (num: number): JSX.Element => {
  if (num === 1) {
    return (
      <div className="space-y-4 bg-card/50 p-6 rounded-lg">
        <p className="text-muted-foreground leading-relaxed">
          The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
        </p>
      </div>
    );
  }

  if (num === 2) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Our intellectual property</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
            </p>
            <p>
              Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
            </p>
            <p>
              The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 3) {
    return (
      <div className="space-y-4 bg-card/50 p-6 rounded-lg">
        <p className="text-muted-foreground mb-4">By using the Services, you represent and warrant that:</p>
        <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
          <li>all registration information you submit will be true, accurate, current, and complete;</li>
          <li>you will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
          <li>you have the legal capacity and you agree to comply with these Legal Terms;</li>
          <li>you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services;</li>
          <li>you will not access the Services through automated or non-human means, whether through a bot, script or otherwise;</li>
          <li>you will not use the Services for any illegal or unauthorized purpose;</li>
          <li>your use of the Services will not violate any applicable law or regulation.</li>
        </ol>
      </div>
    );
  }

  if (num === 4) {
    return (
      <div className="space-y-4 bg-card/50 p-6 rounded-lg">
        <p className="text-muted-foreground leading-relaxed">
          You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
        </p>
      </div>
    );
  }

  if (num === 5) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Billing and Renewal</h3>
          <p className="text-muted-foreground leading-relaxed">
            We offer subscription services that may be subject to billing and renewal terms.
          </p>
        </div>
        <div className="bg-card/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Free Trial</h3>
          <p className="text-muted-foreground leading-relaxed">
            We offer a 14-day free trial to new users who register with the Services. The trial will automatically convert to a paid subscription at the end of the free trial.
          </p>
        </div>
        <div className="bg-card/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Cancellation</h3>
          <p className="text-muted-foreground leading-relaxed">
            You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at <a href="mailto:mealsyncofficial@gmail.com" className="text-primary hover:underline">mealsyncofficial@gmail.com</a>.
          </p>
        </div>
        <div className="bg-card/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Fee Changes</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
          </p>
        </div>
      </div>
    );
  }

  if (num === 6) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
          <p className="text-muted-foreground mb-4">As a user of the Services, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
            <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
            <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
            <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
            <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
            <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
            <li>Engage in unauthorized framing of or linking to the Services.</li>
            <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other malicious code.</li>
            <li>Use the Services to advertise or offer to sell goods and services.</li>
            <li>Engage in any automated use of the system.</li>
            <li>Delete the copyright or other proprietary rights notice from any Content.</li>
            <li>Attempt to impersonate another user or person.</li>
            <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism.</li>
            <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
            <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
            <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
            <li>Copy or adapt the Services' software.</li>
            <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
            <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (num === 7) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites.
          </p>
          <p className="text-muted-foreground mb-4">When you create or make available any Contributions, you thereby represent and warrant that:</p>
          <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
            <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
            <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
            <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
            <li>Your Contributions are not false, inaccurate, or misleading.</li>
            <li>Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
            <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable.</li>
            <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
            <li>Your Contributions are not used to harass or threaten any other person and to promote violence against a specific person or class of people.</li>
            <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
            <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
            <li>Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
            <li>Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
            <li>Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (num === 8) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            You and Services agree that we may access, store, process, and use any information and personal data that you provide following the terms of the Privacy Policy and your choices (including settings).
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
          </p>
        </div>
      </div>
    );
  }

  if (num === 9) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers (each such account, a "Third-Party Account") by either:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-6">
            <li>providing your Third-Party Account login information through the Services; or</li>
            <li>allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account.</li>
          </ol>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.
            </p>
            <p>
              By granting us access to any Third-Party Accounts, you understand that we may access, make available, and store any content that you have provided to and stored in your Third-Party Account so that it is available on and through the Services via your account.
            </p>
            <p>
              Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Services.
            </p>
            <p className="font-semibold">
              PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 10) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            The Services may contain (or you may be sent via the Site) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content").
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content.
            </p>
            <p>
              Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to leave the Services and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms no longer govern.
            </p>
            <p>
              Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 11) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            We allow advertisers to display their advertisements and other information in certain areas of the Services, such as sidebar advertisements or banner advertisements. If you are an advertiser, you shall take full responsibility for any advertisements you place on the Services and any services provided on the Services or products sold through those advertisements.
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Further, as an advertiser, you warrant and represent that you possess all rights and authority to place advertisements on the Services, including, but not limited to, intellectual property rights, publicity rights, and contractual rights.
            </p>
            <p>
              We simply provide the space to place such advertisements, and we have no other relationship with advertisers. If you purchase any product or service on the Services, you are dealing directly with the advertiser providing such product or service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 12) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-6">
            <li>Monitor the Services for violations of these Legal Terms.</li>
            <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities.</li>
            <li>In our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof.</li>
            <li>In our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems.</li>
            <li>Otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (num === 13) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            We care about data privacy and security. Please review our Privacy Policy: <span className="text-primary">https://mealsync.com/privacy</span>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Please be advised the Services are hosted in India. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in India, then through your continued use of the Services, you are transferring your data to India, and you expressly consent to have your data transferred to and processed in India.
          </p>
        </div>
      </div>
    );
  }

  if (num === 14) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We may terminate your use or participation in the Services or delete your account and any content or information that you posted at any time, without warning, in our sole discretion.
            </p>
            <p>
              If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party.
            </p>
            <p>
              In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 15) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you.
            </p>
            <p>
              You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 16) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of India applicable to agreements made and to be entirely performed within India, without regard to its conflict of law principles.
          </p>
        </div>
      </div>
    );
  }

  if (num === 17) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
            </p>
            <p className="font-semibold">
              Binding Arbitration
            </p>
            <p>
              If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute shall be finally and exclusively resolved by binding arbitration. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the Indian Arbitration and Conciliation Act, 1996.
            </p>
            <p>
              Your arbitration fees and your share of arbitrator compensation shall be governed by the Indian Arbitration and Conciliation Act, 1996. The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing but need not provide a statement of reasons unless requested by either Party.
            </p>
            <p>
              The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except as otherwise provided herein, the Parties may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the arbitrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 18) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            Although we try to ensure that all information contained on the Services is correct, we do not warrant its completeness or accuracy. We may make changes to the material contained on the Services, or to the products and prices described in it, at any time without notice. The material contained on the Services may be out of date, and we make no commitment to update such material.
          </p>
        </div>
      </div>
    );
  }

  if (num === 19) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS.</li>
              <li>PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES.</li>
              <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN.</li>
              <li>ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES.</li>
              <li>ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY.</li>
              <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (num === 20) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
            </p>
            <p>
              CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 21) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
            <li>your Contributions;</li>
            <li>use of the Services;</li>
            <li>breach of these Legal Terms;</li>
            <li>any breach of your representations and warranties set forth in these Legal Terms;</li>
            <li>your violation of the rights of a third party, including but not limited to intellectual property rights; or</li>
            <li>any overt harmful act toward any other user of the Services with whom you connected via the Services.</li>
          </ol>
          <p className="text-muted-foreground leading-relaxed mt-6">
            Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
          </p>
        </div>
      </div>
    );
  }

  if (num === 22) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
          </p>
        </div>
      </div>
    );
  }

  if (num === 23) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-4">
            Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
          </p>
        </div>
      </div>
    );
  }

  if (num === 24) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision.
            </p>
            <p>
              These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.
            </p>
            <p>
              If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions.
            </p>
            <p>
              There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them.
            </p>
            <p>
              You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (num === 25) {
    return (
      <div className="space-y-6">
        <div className="bg-card/50 p-6 rounded-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
          </p>
          <div className="space-y-2 text-muted-foreground">
            <p><span className="font-semibold">MealSync</span></p>
            <p>Amrut Garden, Ashok Nagar Nashik</p>
            <p>422008, Nashik, Maharastra</p>
            <p>India</p>
            <p>Email: <a href="mailto:mealsyncofficial@gmail.com" className="text-primary hover:underline">mealsyncofficial@gmail.com</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-card/50 p-6 rounded-lg">
      <p className="text-muted-foreground">Content for this section is being updated. Please check back later.</p>
    </div>
  );
};

export default TermsOfService; 