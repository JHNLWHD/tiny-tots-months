
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { LifeBuoy, Book, Info, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <Layout>
      <Helmet>
        <title>Help & Support - Tiny Tots Milestones</title>
        <meta name="description" content="Find answers to common questions and get support for your Tiny Tots Milestones account." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 gap-3">
          <LifeBuoy className="h-8 w-8 text-baby-purple" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-baby-purple" />
                <span>User Guide</span>
              </CardTitle>
              <CardDescription>Learn how to use all features</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Comprehensive guides on how to make the most of Tiny Tots Milestones.</p>
              <Button variant="outline" className="w-full">Browse Guides</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-baby-purple" />
                <span>FAQs</span>
              </CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Find solutions to the most frequently asked questions about our platform.</p>
              <Button variant="outline" className="w-full" asChild>
                <a href="#faqs">View FAQs</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-baby-purple" />
                <span>Contact Support</span>
              </CardTitle>
              <CardDescription>Get personalized assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Need more help? Our support team is ready to assist you.</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-10 shadow-md" id="faqs">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a baby profile?</AccordionTrigger>
                <AccordionContent>
                  To create a baby profile, log in to your account and navigate to the dashboard. Click on "Add Baby" 
                  button and fill in your baby's details including name, date of birth, and an optional photo. Click 
                  "Save" to create the profile. Free accounts can create one baby profile, while premium accounts can 
                  create unlimited profiles.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I upload photos and videos?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the month view for your baby by selecting your baby's profile and clicking on the specific 
                  month. In the Photos section, click on "Upload Photos" button. You can select multiple photos or videos 
                  from your device. Each file can be up to 25MB in size. You can also add optional captions to each media item.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I share my baby's milestones with family?</AccordionTrigger>
                <AccordionContent>
                  You can share either an entire baby profile or specific months. To share, go to the baby's dashboard 
                  or a specific month view and click on the "Share" button. This generates a unique shareable link that 
                  you can copy and send to family and friends. Anyone with the link can view the shared content without 
                  needing an account.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What's the difference between free and premium accounts?</AccordionTrigger>
                <AccordionContent>
                  Free accounts can create one baby profile and have basic access to all features. Premium accounts can 
                  create unlimited baby profiles, have increased storage for media uploads, and get access to additional 
                  premium features like themed milestone templates and enhanced sharing options.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I upgrade to a premium account?</AccordionTrigger>
                <AccordionContent>
                  To upgrade, go to your account settings or click on the "Upgrade" button in the dashboard. Follow the 
                  instructions to submit your payment proof. Our team will verify your payment and upgrade your account 
                  within 24-48 hours.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Can I delete photos or milestones after adding them?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can delete both photos and milestones. For photos, go to the month view and hover over the 
                  photo you want to delete. Click on the delete icon and confirm. For milestones, go to the milestone 
                  section and click on the delete button next to the milestone you want to remove.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  We take data security seriously. All your data is stored securely in the cloud with encryption, and we 
                  never share your information without your consent. Shared links are generated with unique tokens and 
                  can be revoked at any time. For more details, please see our Privacy Policy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Can't find the answer you're looking for? Our support team is here to help.</p>
            <Button className="bg-baby-purple hover:bg-baby-purple/90" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;
