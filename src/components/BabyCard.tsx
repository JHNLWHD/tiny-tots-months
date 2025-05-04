
import { format, parseISO } from "date-fns";
import { Baby } from "@/hooks/useBabyProfiles";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Baby as BabyIcon } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BabyCardProps {
  baby: Baby;
  onDelete: (id: string) => void;
  backgroundClass?: string;
}

const BabyCard = ({ baby, onDelete, backgroundClass = "bg-baby-blue" }: BabyCardProps) => {
  const navigate = useNavigate();
  const age = calculateAge(baby.date_of_birth);
  
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

  const formattedDate = format(parseISO(baby.date_of_birth), "MMMM d, yyyy");

  const handleCardClick = () => {
    navigate('/month/1'); // Navigate to month 1 by default
  };

  return (
    <Card className={`${backgroundClass} overflow-hidden transition-all hover:shadow-lg`}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="mb-2 mt-4">
          <BabyIcon size={48} className="text-white" />
        </div>
        <h3 className="font-bold text-xl text-white truncate max-w-full">{baby.name}</h3>
        <p className="text-sm text-white/90">{age} old</p>
        <p className="text-xs text-white/80 mt-1">Born: {formattedDate}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-3 bg-white/20 gap-2">
        <Button 
          onClick={handleCardClick} 
          variant="secondary" 
          className="text-xs"
        >
          View Milestones
        </Button>
        
        <div className="flex gap-2">
          <ShareButton 
            babyId={baby.id}
            babyName={baby.name}
            type="baby"
            className="text-xs"
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Baby Profile</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {baby.name}'s profile? This action cannot be undone and will remove all associated milestones and photos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(baby.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BabyCard;
