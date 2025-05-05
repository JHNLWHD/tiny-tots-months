
import React from 'react';
import FeatureCard from './FeatureCard';
import { Camera, Check, Star, Rocket, Lightbulb, BookOpen, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Monthly Milestone Tracking',
      description: 'Document your baby\'s development month by month with our easy-to-use milestone tracker. Select from pre-defined milestones or add your own custom achievements.',
      features: [
        { text: 'Organized by month', icon: <Check className="h-5 w-5 text-green-500 mr-2" /> },
        { text: 'Pre-defined milestone suggestions', icon: <Star className="h-5 w-5 text-baby-purple mr-2" /> },
        { text: 'Custom milestone entries', icon: <Rocket className="h-5 w-5 text-baby-blue mr-2" /> }
      ],
      imageTitle: 'Milestone Tracker Screenshot',
      colorClass: 'text-baby-purple',
      imagePosition: 'left' as const,
      icon: <Lightbulb size={64} className="text-baby-purple" />
    },
    {
      title: 'Photo & Video Collection',
      description: 'Upload and organize photos and videos by month, creating a beautiful visual record of your baby\'s growth journey.',
      features: [
        { text: 'Upload unlimited photos (Premium)', icon: <Camera className="h-5 w-5 text-baby-pink mr-2" /> },
        { text: 'Add videos of special moments (Premium)', icon: <Star className="h-5 w-5 text-baby-yellow mr-2" /> },
        { text: 'Add captions to remember the context', icon: <Check className="h-5 w-5 text-green-500 mr-2" /> }
      ],
      imageTitle: 'Photo Gallery Screenshot',
      colorClass: 'text-baby-pink',
      imagePosition: 'right' as const,
      icon: <Camera size={64} className="text-baby-pink" />
    },
    {
      title: 'Export to PDF/Book',
      description: 'Premium subscribers can export their baby\'s milestones and photos into a beautifully formatted PDF or book layout, perfect for printing.',
      features: [
        { text: 'Create beautiful keepsakes', icon: <Star className="h-5 w-5 text-baby-mint mr-2" /> },
        { text: 'Multiple design templates', icon: <Rocket className="h-5 w-5 text-baby-blue mr-2" /> },
        { text: 'High-resolution print quality', icon: <Check className="h-5 w-5 text-green-500 mr-2" /> }
      ],
      imageTitle: 'PDF Export Preview',
      colorClass: 'text-baby-mint',
      imagePosition: 'left' as const,
      icon: <BookOpen size={64} className="text-baby-mint" />
    }
  ];

  return (
    <section className="bg-gray-50 py-16" id="features" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <h2 id="features-heading" className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="space-y-12 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              imageTitle={feature.imageTitle}
              colorClass={feature.colorClass}
              imagePosition={feature.imagePosition}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
