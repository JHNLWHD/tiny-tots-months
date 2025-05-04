
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This would connect to an email service in a production environment
    toast.success("Thank you for your message! We'll get back to you soon.");
  };
  
  return (
    <Layout>
      <Helmet>
        <title>Contact Us - Tiny Tots Milestones</title>
        <meta name="description" content="Get in touch with the Tiny Tots Milestones team. We're here to help with any questions or concerns." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 gap-3">
          <MessageSquare className="h-8 w-8 text-baby-purple" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-800">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input id="email" type="email" required placeholder="Your email address" />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input id="subject" required placeholder="Subject of your message" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    required 
                    placeholder="Please type your message here" 
                    className="min-h-[150px]" 
                  />
                </div>
                
                <Button type="submit" className="w-full bg-baby-purple hover:bg-baby-purple/90">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-baby-purple mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">Email Us</p>
                      <a href="mailto:support@tinytotsmilestones.com" className="text-baby-purple hover:underline">
                        support@tinytotsmilestones.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-baby-purple mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">Call Us</p>
                      <a href="tel:+1234567890" className="text-baby-purple hover:underline">
                        +1 (234) 567-890
                      </a>
                      <p className="text-sm text-gray-500">Monday-Friday, 9am-5pm ET</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We strive to respond to all inquiries within 24-48 business hours.</p>
                <p className="mt-2">For urgent matters related to account access or data concerns, please email us with "URGENT" in the subject line.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
