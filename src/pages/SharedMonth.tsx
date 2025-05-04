
import { useParams } from 'react-router-dom';
import { useSharedData } from '@/hooks/useSharedData';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoCollage from '@/components/PhotoCollage';
import MilestoneList from '@/components/MilestoneList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';
import MilestoneDisplay from '@/components/MilestoneDisplay';
import { Star } from 'lucide-react';

const backgroundColors = [
  "bg-baby-blue",
  "bg-baby-pink",
  "bg-baby-mint",
  "bg-baby-yellow",
  "bg-baby-peach",
  "bg-baby-purple",
];

const SharedMonth = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { shareLink, baby, photos, milestones, isLoading, notFound } = useSharedData(shareToken || '');
  
  // Additional logging to help debug
  useEffect(() => {
    console.log('SharedMonth component rendered with token:', shareToken);
    console.log('Share data state:', { 
      shareLink, 
      shareLinkId: shareLink?.id,
      babyId: shareLink?.baby_id,
      monthNumber: shareLink?.month_number,
      babyExists: !!baby, 
      photoCount: photos?.length, 
      milestoneCount: milestones?.length,
      isLoading, 
      notFound 
    });
  }, [shareToken, shareLink, baby, photos, milestones, isLoading, notFound]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !baby || !shareLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Month Not Found</h1>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Invalid or Expired Link</AlertTitle>
            <AlertDescription>
              This shared link may have been deleted, expired, or never existed. 
              If you received this link from someone, ask them to generate a new one.
            </AlertDescription>
          </Alert>
          <p className="text-gray-500">
            Share token: {shareToken}
          </p>
          <p className="text-gray-500 mt-2">
            Debug info: {notFound ? 'Not found flag set' : 'Not found flag not set'}, 
            {shareLink ? 'Share link exists' : 'No share link'}, 
            {baby ? 'Baby data exists' : 'No baby data'}
          </p>
        </div>
      </div>
    );
  }
  
  const monthNumber = shareLink.month_number || 1;
  const formattedDate = baby.date_of_birth ? format(parseISO(baby.date_of_birth), "MMMM d, yyyy") : '';
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {baby.name}'s Month {monthNumber} Milestones
            </h1>
            <p className="text-gray-600">Born on {formattedDate}</p>
          </div>
          
          <div className={`w-full h-24 ${backgroundColors[monthNumber % backgroundColors.length]} rounded-lg mb-8 flex items-center justify-center`}>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Month {monthNumber}</h2>
          </div>
          
          <Tabs defaultValue="photos">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Photos</h2>
                {photos && photos.length > 0 ? (
                  <div className="space-y-6">
                    <PhotoGrid photos={photos} readOnly />
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="text-lg font-medium mb-4">Photo Collection</h3>
                      <PhotoCollage photos={photos} maxDisplayCount={5} />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No photos available for this month.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="milestones">
              <div>
                <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                {milestones && milestones.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {milestones.slice(0, 4).map((milestone) => (
                        <MilestoneDisplay 
                          key={milestone.id}
                          title={milestone.milestone_text.split('\n')[0] || 'Milestone'}
                          description={milestone.milestone_text}
                          icon={<Star className="h-5 w-5" />}
                        />
                      ))}
                    </div>
                    
                    {/* If we have more than 4 milestones, show the rest in a list */}
                    {milestones.length > 4 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Additional Milestones</h3>
                        <MilestoneList milestones={milestones.slice(4)} readOnly />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No milestones recorded for this month.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <footer className="text-center py-8 text-sm text-gray-500">
        <p>Shared via Tiny Tots Milestones</p>
      </footer>
    </div>
  );
};

export default SharedMonth;
