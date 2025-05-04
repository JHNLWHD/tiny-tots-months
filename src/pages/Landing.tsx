
import React from 'react';
import { Link } from 'react-router-dom';
import { Baby, ChevronRight, Camera, BookOpen, Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby size={28} className="text-baby-blue" />
            <span className="text-xl font-semibold text-gray-800">Tiny Tots Milestones</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app">Demo</Link>
            </Button>
            <Button asChild>
              <Link to="/app">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-baby-blue/20 to-white pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Capture Every Precious Moment of Your Baby's Journey
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                Document and share your baby's growth milestones, month by month, in a beautiful digital keepsake that lasts forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="px-8" asChild>
                  <Link to="/app">
                    Start Your Journey <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link to="/app">View Demo</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl rotate-2 border-4 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" 
                    alt="Baby milestone tracker" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg border-2 border-baby-pink/20 rotate-[-4deg]">
                  <p className="text-sm font-medium">Month 5: First smile! 💕</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Designed for Modern Parents</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to preserve your baby's precious moments in one beautiful, easy-to-use platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="h-8 w-8 text-baby-blue" />,
                title: "Photo Collections",
                description: "Store unlimited photos organized by month, milestone, and special events."
              },
              {
                icon: <BookOpen className="h-8 w-8 text-baby-pink" />,
                title: "Milestone Tracking",
                description: "Document first smiles, steps, words, and all those special 'firsts'."
              },
              {
                icon: <Heart className="h-8 w-8 text-baby-mint" />,
                title: "Family Sharing",
                description: "Share milestones with family members while keeping them private from the public."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-baby-mint/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Parents Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "This app helped me create a beautiful memory book for my daughter without any effort. The month-by-month organization is perfect!",
                author: "Sarah M., Mother of 2"
              },
              {
                quote: "As a busy dad, I love how easy it is to upload photos and notes about my son's development. Grandparents absolutely love it!",
                author: "Michael L., Father of 1"
              },
              {
                quote: "The best baby milestone tracker I've used. Clean design, easy to navigate, and keeps everything organized perfectly.",
                author: "Jessica T., Mother of 3"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 flex flex-col">
                <div className="mb-4 text-baby-blue">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic text-gray-700 mb-4 flex-grow">"{testimonial.quote}"</p>
                <p className="font-semibold text-sm">{testimonial.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Choose the perfect plan for your family's journey.
          </p>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-center max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">Free</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8 flex-grow">
                {['Up to 50 photos', '12 months tracking', 'Basic milestones'].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app">Get Started</Link>
              </Button>
            </Card>
            
            {/* Premium Plan */}
            <Card className="border-2 border-baby-blue p-6 flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-baby-blue text-white text-xs font-bold px-3 py-1 transform translate-x-[30%] translate-y-[30%] rotate-45">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$4.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For the complete experience</p>
              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  'Unlimited photos', 
                  'Unlimited milestones', 
                  'Video support',
                  'Family sharing',
                  'Export to PDF/Book',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link to="/app">Start 14-Day Free Trial</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-baby-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Documenting Your Baby's Journey Today</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Don't miss a single precious milestone. Create your baby's digital memory book in just minutes.
          </p>
          <Button size="lg" className="px-8" asChild>
            <Link to="/app">
              Get Started For Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Baby size={24} className="text-baby-blue" />
              <span className="text-lg font-semibold text-gray-800">Tiny Tots Milestones</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center">
              <Link to="/app" className="text-gray-600 hover:text-gray-900">Demo</Link>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Terms</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Tiny Tots Milestones. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
