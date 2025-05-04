import React from 'react';
import { Link } from 'react-router-dom';
import { Baby, CheckCircle2, ArrowRight, Camera, Share2, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="joyful-gradient py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Baby size={48} className="text-baby-purple animate-bounce-soft" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Capture Every Precious <span className="text-baby-purple">Milestone</span> of Your Little One
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Document and share your baby's developmental journey month by month with photos, videos, and milestone tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-8">
              {isAuthenticated ? (
                <Link to="/app">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link to="/auth">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </Button>
            <Button asChild variant="outline" size="lg" className="border-baby-purple text-baby-purple hover:bg-baby-purple/10 rounded-full px-8">
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="bg-white py-16" id="problem-solution">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Tiny Tots Milestones?</h2>
            <p className="text-gray-600">
              Parents often struggle with scattered photos, messy notes, and the challenge of sharing their baby's growth with loved ones. 
              Tiny Tots Milestones brings it all together in one beautiful, easy-to-use app.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-baby-blue/10 p-8 rounded-xl text-center">
              <div className="bg-baby-blue/20 inline-flex p-3 rounded-full mb-4">
                <Camera className="h-6 w-6 text-baby-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Organized Memories</h3>
              <p className="text-gray-600">
                Effortlessly organize your baby's photos and videos month by month, never lose a precious moment again.
              </p>
            </div>
            <div className="bg-baby-pink/10 p-8 rounded-xl text-center">
              <div className="bg-baby-pink/20 inline-flex p-3 rounded-full mb-4">
                <CheckCircle2 className="h-6 w-6 text-baby-pink" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Development</h3>
              <p className="text-gray-600">
                Record and celebrate developmental milestones with our guided suggestions for each age.
              </p>
            </div>
            <div className="bg-baby-mint/10 p-8 rounded-xl text-center">
              <div className="bg-baby-mint/20 inline-flex p-3 rounded-full mb-4">
                <Share2 className="h-6 w-6 text-baby-mint" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Private Sharing</h3>
              <p className="text-gray-600">
                Securely share your baby's journey with family and friends using unique private links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-gray-50 py-16" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold mb-4 text-baby-purple">Monthly Milestone Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Document your baby's development month by month with our easy-to-use milestone tracker. Select from pre-defined milestones or add your own custom achievements.
                </p>
                <ul className="space-y-2">
                  {['Organized by month', 'Pre-defined milestone suggestions', 'Custom milestone entries'].map(item => (
                    <li key={item} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-baby-purple/5 p-4 rounded-xl">
                {/* Placeholder for screenshot/illustration */}
                <div className="aspect-video bg-baby-purple/20 rounded-lg flex items-center justify-center">
                  <span className="text-baby-purple">Milestone Tracker Screenshot</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold mb-4 text-baby-pink">Photo & Video Collection</h3>
                <p className="text-gray-600 mb-4">
                  Upload and organize photos and videos by month, creating a beautiful visual record of your baby's growth journey.
                </p>
                <ul className="space-y-2">
                  {['Upload unlimited photos (Premium)', 'Add videos of special moments (Premium)', 'Add captions to remember the context'].map(item => (
                    <li key={item} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-baby-pink/5 p-4 rounded-xl">
                {/* Placeholder for screenshot/illustration */}
                <div className="aspect-video bg-baby-pink/20 rounded-lg flex items-center justify-center">
                  <span className="text-baby-pink">Photo Gallery Screenshot</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold mb-4 text-baby-blue">Private Sharing Links</h3>
                <p className="text-gray-600 mb-4">
                  Generate unique, secure links to share with family and friends, allowing them to view your baby's milestones without needing an account.
                </p>
                <ul className="space-y-2">
                  {['Share the entire journey', 'Share specific months', 'Family sharing (Premium)'].map(item => (
                    <li key={item} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-baby-blue/5 p-4 rounded-xl">
                {/* Placeholder for screenshot/illustration */}
                <div className="aspect-video bg-baby-blue/20 rounded-lg flex items-center justify-center">
                  <span className="text-baby-blue">Sharing Features Screenshot</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold mb-4 text-baby-mint">Export to PDF/Book</h3>
                <p className="text-gray-600 mb-4">
                  Premium subscribers can export their baby's milestones and photos into a beautifully formatted PDF or book layout, perfect for printing.
                </p>
                <ul className="space-y-2">
                  {['Create beautiful keepsakes', 'Multiple design templates', 'High-resolution print quality'].map(item => (
                    <li key={item} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-baby-mint/5 p-4 rounded-xl">
                {/* Placeholder for screenshot/illustration */}
                <div className="aspect-video bg-baby-mint/20 rounded-lg flex items-center justify-center">
                  <span className="text-baby-mint">PDF Export Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-16" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that's right for your family. Start with our free plan and upgrade anytime as your baby grows.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 mb-6">Perfect for getting started</p>
              <p className="text-3xl font-bold mb-6">₱0 <span className="text-base font-normal text-gray-500">forever</span></p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Track 1 baby only',
                  'Track milestones up to 3 months',
                  '5 photos per month (15 total)',
                  'Unique shareable links',
                  'Basic milestone suggestions',
                ].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild className="w-full rounded-full" variant="outline">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="border-2 border-baby-purple rounded-xl p-8 bg-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-baby-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-gray-500 mb-6">For growing families</p>
              <p className="text-3xl font-bold mb-6">₱1,000 <span className="text-base font-normal text-gray-500">one-time payment</span></p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited baby profiles',
                  'Complete 12 months milestone tracking',
                  'Unlimited photo uploads',
                  'Video uploads',
                  'Priority support',
                  'Unique shareable links',
                  'Advanced milestone suggestions',
                ].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild className="w-full bg-baby-purple hover:bg-baby-purple/90 rounded-full">
                {isAuthenticated ? (
                  <Link to="/app/upgrade">Get Premium</Link>
                ) : (
                  <Link to="/auth">Get Premium</Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="joyful-gradient-2 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Documenting Your Baby's Journey Today</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Don't miss a moment of your child's precious first years. Sign up now and start creating memories that will last a lifetime.
          </p>
          <Button asChild size="lg" className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-8">
            {isAuthenticated ? (
              <Link to="/app">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link to="/auth">
                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Baby className="h-8 w-8 text-baby-purple mr-2" />
              <span className="font-bold text-lg text-baby-purple">Tiny Tots Milestones</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-baby-purple">Privacy Policy</a>
              <a href="#" className="hover:text-baby-purple">Terms of Service</a>
              <a href="#" className="hover:text-baby-purple">Contact Us</a>
              <a href="#" className="hover:text-baby-purple">Help & Support</a>
            </div>
          </div>
          <div className="text-center mt-10 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Tiny Tots Milestones. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
