
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  imageTitle: string;
  colorClass: string;
  imagePosition: 'left' | 'right';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  features,
  imageTitle,
  colorClass,
  imagePosition
}) => {
  const contentOrder = imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse';
  
  return (
    <article className={`flex flex-col ${contentOrder} gap-8 items-center`}>
      <div className="md:w-1/2">
        <h3 className={`text-2xl font-semibold mb-4 ${colorClass}`}>{title}</h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <ul className="space-y-2">
          {features.map(item => (
            <li key={item} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`md:w-1/2 ${colorClass.replace('text', 'bg')}/5 p-4 rounded-xl`}>
        <figure className={`aspect-video ${colorClass.replace('text', 'bg')}/20 rounded-lg flex items-center justify-center`}>
          <figcaption className={`${colorClass}`}>{imageTitle}</figcaption>
        </figure>
      </div>
    </article>
  );
};

export default FeatureCard;
