
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBabyProfiles } from '@/hooks/useBabyProfiles';
import { useSubscription } from '@/hooks/useSubscription';
import { useShareLinks } from '@/hooks/useShareLinks';
import { Crown, Plus, Baby, Calendar, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import BabyForm from '@/components/BabyForm';
import MonthCard from '@/components/MonthCard';

const Home = () => {
  const { user } = useAuth();
  const { babies, loading: isLoading, createBaby } = useBabyProfiles();
  const { isPremium } = useSubscription();
  const { generateShareLink, isGenerating: isGeneratingLink } = useShareLinks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedBaby, setSelectedBaby] = React.useState<any>(null);
  const [shareLink, setShareLink] = React.useState<string>('');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      birthdate: '',
      gender: 'other'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createBaby({
        name: data.name,
        dateOfBirth: data.birthdate
      });
      reset();
      setIsDialogOpen(false);
      toast.success(`${data.name} added successfully!`);
    } catch (error: any) {
      toast.error(`Failed to add baby: ${error.message}`);
    }
  };

  const handleShareBaby = async (baby: any) => {
    setSelectedBaby(baby);
    setShareDialogOpen(true);
    setShareLink('');
  };

  const handleGenerateLink = async () => {
    if (!selectedBaby) return;
    
    try {
      // Generate a share link using the useShareLinks hook
      const token = await generateShareLink(selectedBaby.id, 'baby');
      
      // Create the shareable link
      const shareableLink = `${window.location.origin}/shared/baby/${token}`;
      setShareLink(shareableLink);
    } catch (error: any) {
      toast.error(`Failed to generate link: ${error.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  // Monthly background colors for the month cards
  const monthlyBackgroundClasses = [
    'bg-baby-blue/20', 'bg-baby-purple/20', 'bg-baby-pink/20', 'bg-baby-green/20',
    'bg-amber-100', 'bg-yellow-100', 'bg-orange-100', 'bg-rose-100',
    'bg-teal-100', 'bg-sky-100', 'bg-indigo-100', 'bg-violet-100',
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="p-6 border-dashed border-2 border-gray-300 hover:border-baby-purple hover:bg-baby-purple/5 transition-colors cursor-pointer flex flex-col items-center justify-center h-64">
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">Add a Baby</p>
              <p className="text-sm text-gray-500 text-center mt-2">
                {isPremium ? 'Add as many babies as you want' : 'Free plan allows 1 baby'}
              </p>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Baby</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Baby's Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter baby's name" 
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input 
                  id="birthdate" 
                  type="date" 
                  {...register("birthdate", { required: "Birthdate is required" })}
                />
                {errors.birthdate && <p className="text-red-500 text-sm">{errors.birthdate.message?.toString()}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("gender")}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Baby</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {isLoading ? (
          <Card className="p-6 h-64 flex items-center justify-center">
            <div className="animate-pulse text-baby-purple">Loading...</div>
          </Card>
        ) : (
          babies.map((baby: any) => (
            <Card key={baby.id} className="p-6 h-64 flex flex-col">
              <div className="flex items-center mb-4">
                <Baby className="h-8 w-8 text-baby-purple mr-2" />
                <h2 className="text-xl font-bold">{baby.name}</h2>
              </div>
              
              <div className="text-sm text-gray-500 mb-2">
                <p>Birthdate: {format(new Date(baby.date_of_birth), 'MMMM d, yyyy')}</p>
                <p className="capitalize">Gender: {baby.gender || 'Not specified'}</p>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                <Link 
                  to={`/app/month/1`} 
                  className="w-full px-4 py-2 bg-baby-purple text-white rounded-lg flex items-center justify-center hover:bg-baby-purple/90"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Milestones
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleShareBaby(baby)}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* Month Cards Section - Restore this functionality */}
      {babies.length > 0 && !isLoading && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Monthly Milestones</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MonthCard 
                key={month}
                month={month}
                backgroundClass={monthlyBackgroundClasses[(month - 1) % monthlyBackgroundClasses.length]}
                babyId={babies[0]?.id}
              />
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {selectedBaby?.name}'s Journey</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-500">
              Generate a unique link to share your baby's milestones with family and friends.
              They'll be able to view without needing an account.
            </p>
            
            {!shareLink ? (
              <Button 
                onClick={handleGenerateLink} 
                className="w-full"
                disabled={isGeneratingLink}
              >
                {isGeneratingLink ? 'Generating...' : 'Generate Shareable Link'}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex">
                  <Input value={shareLink} readOnly className="rounded-r-none" />
                  <Button 
                    onClick={copyToClipboard}
                    className="rounded-l-none"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This link will allow anyone to view your baby's milestones. Don't share it publicly.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {babies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Baby className="h-16 w-16 text-baby-purple/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Babies Added Yet</h2>
          <p className="text-gray-500 mb-6">
            Add your first baby to start tracking their milestones and memories.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Baby
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
