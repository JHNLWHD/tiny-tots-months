
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBabyProfiles } from '@/hooks/useBabyProfiles';
import { useSubscription } from '@/hooks/useSubscription';
import { useShareLinks } from '@/hooks/useShareLinks';
import { Crown, Plus } from 'lucide-react';

// Component imports
import BabyList from '@/components/home/BabyList';
import AddBabyDialog from '@/components/home/AddBabyDialog';
import MonthCardGrid from '@/components/home/MonthCardGrid';
import ShareBabyDialog from '@/components/home/ShareBabyDialog';
import EmptyState from '@/components/home/EmptyState';

const Home = () => {
  const { user } = useAuth();
  const { babies, loading: isLoading, createBaby } = useBabyProfiles();
  const { isPremium } = useSubscription();
  const { generateShareLink, isGenerating: isGeneratingLink } = useShareLinks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedBaby, setSelectedBaby] = React.useState<any>(null);
  
  const handleShareBaby = async (baby: any) => {
    setSelectedBaby(baby);
    setShareDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, <span className="text-baby-purple">{user?.email}</span>
        </h1>
        
        {!isPremium && (
          <Link
            to="/app/upgrade"
            className="mt-4 md:mt-0 px-6 py-2 bg-baby-purple text-white rounded-lg shadow hover:bg-baby-purple/90 transition-colors flex items-center"
          >
            <Crown className="mr-2 h-5 w-5" />
            Get Premium
          </Link>
        )}
      </div>
      
      <BabyList 
        babies={babies}
        isLoading={isLoading}
        onAddBaby={() => setIsDialogOpen(true)}
        onShareBaby={handleShareBaby}
      />
      
      <MonthCardGrid 
        babyId={babies.length > 0 ? babies[0]?.id : undefined}
        showGrid={babies.length > 0 && !isLoading}
      />
      
      <AddBabyDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        createBaby={createBaby}
      />
      
      <ShareBabyDialog 
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        selectedBaby={selectedBaby}
        generateShareLink={generateShareLink}
        isGenerating={isGeneratingLink}
      />
      
      {babies.length === 0 && !isLoading && (
        <EmptyState onAddBaby={() => setIsDialogOpen(true)} />
      )}
    </div>
  );
};

export default Home;
