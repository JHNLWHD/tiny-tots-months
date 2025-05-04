
import React from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Monthly Milestone Tracking',
      description: 'Document your baby\'s development month by month with our easy-to-use milestone tracker. Select from pre-defined milestones or add your own custom achievements.',
      features: ['Organized by month', 'Pre-defined milestone suggestions', 'Custom milestone entries'],
      imageTitle: 'Milestone Tracker Screenshot',
      colorClass: 'text-baby-purple',
      imagePosition: 'left' as const
    },
    {
      title: 'Photo & Video Collection',
      description: 'Upload and organize photos and videos by month, creating a beautiful visual record of your baby\'s growth journey.',
      features: ['Upload unlimited photos (Premium)', 'Add videos of special moments (Premium)', 'Add captions to remember the context'],
      imageTitle: 'Photo Gallery Screenshot',
      colorClass: 'text-baby-pink',
      imagePosition: 'right' as const
    },
    {
      title: 'Private Sharing Links',
      description: 'Generate unique, secure links to share with family and friends, allowing them to view your baby\'s milestones without needing an account.',
      features: ['Share the entire journey', 'Share specific months', 'Family sharing (Premium)'],
      imageTitle: 'Sharing Features Screenshot',
      colorClass: 'text-baby-blue',
      imagePosition: 'left' as const
    },
    {
      title: 'Export to PDF/Book',
      description: 'Premium subscribers can export their baby\'s milestones and photos into a beautifully formatted PDF or book layout, perfect for printing.',
      features: ['Create beautiful keepsakes', 'Multiple design templates', 'High-resolution print quality'],
      imageTitle: 'PDF Export Preview',
      colorClass: 'text-baby-mint',
      imagePosition: 'right' as const
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
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
