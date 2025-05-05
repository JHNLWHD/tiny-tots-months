
import React from 'react';
import { CheckCircle2, Lightbulb, Camera, BookOpen } from 'lucide-react';

interface FeatureItem {
  text: string;
  icon?: React.ReactNode;
}

interface FeatureCardProps {
  title: string;
  description: string;
  features: FeatureItem[] | string[];
  imageTitle: string;
  colorClass: string;
  imagePosition: 'left' | 'right';
  icon?: React.ReactNode; // New prop for the main feature icon
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  features,
  imageTitle,
  colorClass,
  imagePosition,
  icon // Default icon if none provided
}) => {
  const contentOrder = imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse';
  
  // Determine which icon to show based on the title if no icon is provided
  const getDefaultIcon = () => {
    if (title.includes('Milestone')) return <Lightbulb size={64} className={`${colorClass}`} />;
    if (title.includes('Photo')) return <Camera size={64} className={`${colorClass}`} />;
    if (title.includes('Export')) return <BookOpen size={64} className={`${colorClass}`} />;
    return <CheckCircle2 size={64} className={`${colorClass}`} />;
  };
  
  return (
    <article className={`flex flex-col ${contentOrder} gap-8 items-center`}>
      <div className="md:w-1/2">
        <h3 className={`text-2xl font-semibold mb-4 ${colorClass}`}>{title}</h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <ul className="space-y-2">
          {features.map((item, index) => {
            // Check if the item is a string or an object with text and icon properties
            const isString = typeof item === 'string';
            const text = isString ? item : item.text;
            const itemIcon = isString ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" /> : item.icon;
            
            return (
              <li key={text || index} className="flex items-center">
                {itemIcon || <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" />}
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`md:w-1/2 ${colorClass.replace('text', 'bg')}/5 p-4 rounded-xl flex items-center justify-center`}>
        <div className={`w-32 h-32 rounded-full ${colorClass.replace('text', 'bg')}/20 flex items-center justify-center`}>
          {icon || getDefaultIcon()}
        </div>
      </div>
    </article>
  );
};

export default FeatureCard;
