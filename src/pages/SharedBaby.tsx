
import { useParams } from 'react-router-dom';
import { useSharedData } from '@/hooks/useSharedData';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import MonthCard from '@/components/MonthCard';
import PhotoCollage from '@/components/PhotoCollage';
import { Card, CardContent } from '@/components/ui/card';
import { Baby as BabyIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

const backgroundColors = [
  "bg-baby-blue",
  "bg-baby-pink",
  "bg-baby-mint",
  "bg-baby-yellow",
  "bg-baby-peach",
  "bg-baby-purple",
];

const SharedBaby = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { shareLink, baby, photos, isLoading, notFound, error } = useSharedData(shareToken || '');
  
  // Additional logging to help debug
  useEffect(() => {
    console.log('SharedBaby component rendered with token:', shareToken);
    console.log('Share data state:', { 
      shareLink, 
      shareLinkId: shareLink?.id,
      babyId: shareLink?.baby_id,
      babyExists: !!baby, 
      photoCount: photos?.length, 
      isLoading, 
      notFound 
    });
    if (error) console.error('Share data error:', error);
  }, [shareToken, shareLink, baby, photos, isLoading, notFound, error]);

  function calculateAge(dateOfBirth: string) {
    const birthDate = parseISO(dateOfBirth);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
  }
  
  // Generate months 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
          <p className="text-gray-500">Loading baby profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !shareLink || !baby) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Baby Profile Not Found</h1>
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
  
  const formattedDate = baby.date_of_birth ? format(parseISO(baby.date_of_birth), "MMMM d, yyyy") : '';
  const age = baby.date_of_birth ? calculateAge(baby.date_of_birth) : '';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{baby.name}'s Milestone Journey</h1>
            <p className="text-gray-600">
              {baby.name} is {age} old • Born on {formattedDate}
            </p>
          </div>
          
          <Card className={`${backgroundColors[0]} overflow-hidden mb-10`}>
            <CardContent className="p-6 flex items-center text-center justify-center">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <BabyIcon size={64} className="text-white" />
                </div>
                <h2 className="font-bold text-2xl text-white">{baby.name}</h2>
                <p className="text-white/90">{age} old</p>
                <p className="text-sm text-white/80 mt-1">Born: {formattedDate}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="months" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="months">Monthly Milestones</TabsTrigger>
              <TabsTrigger value="photos">Photo Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="months">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Monthly Milestones</h2>
              <p className="text-gray-600 mb-6">Explore {baby.name}'s special moments month by month</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {months.map((month) => (
                  <MonthCard
                    key={month}
                    month={month}
                    backgroundClass={backgroundColors[month % backgroundColors.length]}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{baby.name}'s Photo Gallery</h2>
              <p className="text-gray-600 mb-6">View all of {baby.name}'s precious moments</p>
              
              {photos && photos.length > 0 ? (
                <div className="space-y-8">
                  {/* Group photos by month */}
                  {Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter(month => photos.some(p => p.month_number === month))
                    .map(month => {
                      const monthPhotos = photos.filter(p => p.month_number === month);
                      return (
                        <div key={month} className="bg-white rounded-lg p-4 shadow-sm">
                          <PhotoCollage 
                            photos={monthPhotos} 
                            title={`Month ${month}`}
                            maxDisplayCount={5}
                          />
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No photos available yet.</p>
                </div>
              )}
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

export default SharedBaby;
