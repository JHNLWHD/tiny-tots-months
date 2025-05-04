
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import MilestoneDisplay from '@/components/MilestoneDisplay';
import PhotoGrid from '@/components/PhotoGrid';
import { Baby, Check } from 'lucide-react';

// Mock data for development
const milestoneData = {
  1: [
    { title: "Lifts head during tummy time", description: "Your baby is starting to develop neck strength." },
    { title: "Follows objects with eyes", description: "Visual tracking is developing." },
    { title: "Responds to sounds", description: "Your baby recognizes your voice and other familiar sounds." }
  ],
  2: [
    { title: "Smiles socially", description: "Your baby is beginning to interact socially with smiles." },
    { title: "Babbles and coos", description: "First vocalizations are emerging." },
    { title: "Holds head more steadily", description: "Neck muscles continue to strengthen." }
  ],
  // Additional months would be added here
};

// Mock photo data
const mockPhotos = {
  1: [
    { id: "1", url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1470&auto=format&fit=crop", caption: "First smile" },
    { id: "2", url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1470&auto=format&fit=crop", caption: "Tummy time" },
  ],
  2: [
    { id: "3", url: "https://images.unsplash.com/photo-1608303588026-884930af2559?q=80&w=1469&auto=format&fit=crop", caption: "Playing with toys" },
  ],
};

const Month = () => {
  const { month } = useParams<{ month: string }>();
  const monthNum = parseInt(month || '1', 10);
  const [photos, setPhotos] = useState<{ id: string; url: string; caption?: string }[]>([]);
  
  const milestones = milestoneData[monthNum as keyof typeof milestoneData] || [];
  
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    setPhotos(mockPhotos[monthNum as keyof typeof mockPhotos] || []);
  }, [monthNum]);
  
  // Handle error case for invalid month
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return <Layout showBackButton title="Not Found">Month not found</Layout>;
  }

  return (
    <Layout showBackButton title={`Month ${monthNum}`}>
      <div className="max-w-4xl mx-auto">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Baby size={24} className="mr-2 text-blue-400" />
            Milestones
          </h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneDisplay
                key={index}
                title={milestone.title}
                description={milestone.description}
                icon={<Check size={20} />}
              />
            ))}
            {milestones.length === 0 && (
              <p className="text-gray-500 text-center py-4">No milestones information available for this month.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Photos</h2>
          <PhotoGrid photos={photos} />
        </section>
      </div>
    </Layout>
  );
};

export default Month;
