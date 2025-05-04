
import React from 'react';
import Layout from '@/components/Layout';
import MonthCard from '@/components/MonthCard';

const backgroundColors = [
  'bg-baby-blue',
  'bg-baby-pink',
  'bg-baby-mint',
  'bg-baby-yellow',
  'bg-baby-peach',
  'bg-baby-purple',
];

const Home = () => {
  // Generate months 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Baby Milestones</h1>
          <p className="text-gray-600">Track your baby's special moments month by month</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {months.map((month) => (
            <MonthCard 
              key={month} 
              month={month} 
              backgroundClass={backgroundColors[month % backgroundColors.length]} 
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
