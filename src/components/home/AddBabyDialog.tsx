
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddBabyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  createBaby: (data: { name: string, dateOfBirth: string }) => Promise<void>;
}

const AddBabyDialog: React.FC<AddBabyDialogProps> = ({ isOpen, setIsOpen, createBaby }) => {
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
      setIsOpen(false);
      toast.success(`${data.name} added successfully!`);
    } catch (error: any) {
      toast.error(`Failed to add baby: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Baby</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBabyDialog;
