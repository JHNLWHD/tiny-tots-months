
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  pricePeriod: string;
  features: string[];
  isPremium?: boolean;
  ctaLink: string;
  ctaText: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  price,
  pricePeriod,
  features,
  isPremium = false,
  ctaLink,
  ctaText
}) => {
  return (
    <article className={`${
      isPremium 
        ? "border-2 border-baby-purple rounded-xl p-8 bg-white shadow-md relative overflow-hidden" 
        : "border border-gray-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow"
    }`}>
      {isPremium && (
        <div className="absolute top-0 right-0 bg-baby-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
          RECOMMENDED
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <p className="text-3xl font-bold mb-6">{price} <span className="text-base font-normal text-gray-500">{pricePeriod}</span></p>
      
      <ul className="space-y-3 mb-8">
        {features.map(item => (
          <li key={item} className="flex items-start">
            <CheckCircle2 
              className={`h-5 w-5 ${isPremium ? "text-baby-purple" : "text-green-500"} mr-2 mt-0.5 flex-shrink-0`} 
              aria-hidden="true" 
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        asChild 
        className={`w-full rounded-full ${
          isPremium 
            ? "bg-baby-purple hover:bg-baby-purple/90" 
            : ""
        }`}
        variant={isPremium ? "default" : "outline"}
      >
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>
    </article>
  );
};

export default PlanCard;
