import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddBabyDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	createBaby: (data: {
		name: string;
		dateOfBirth: string;
		gender: string;
	}) => Promise<void>;
}

const AddBabyDialog: React.FC<AddBabyDialogProps> = ({
	isOpen,
	setIsOpen,
	createBaby,
}) => {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: "",
			birthdate: "",
			gender: "other",
		},
	});

	const gender = watch("gender");

	// Handler for the Select component (gender)
	const handleGenderChange = (value: string) => {
		setValue("gender", value, { shouldValidate: true });
	};

	const onSubmit = async (data) => {
		try {
			await createBaby({
				name: data.name,
				dateOfBirth: data.birthdate,
				gender: data.gender,
			});
			reset();
			setIsOpen(false);
			toast.success(`${data.name} added successfully!`);
		} catch (error) {
			toast.error(`Failed to add baby: ${error.message}`);
		}
	};

	// Reset form when dialog closes
	React.useEffect(() => {
		if (!isOpen) {
			reset();
		}
	}, [isOpen, reset]);

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
						{errors.name && (
							<p className="text-red-500 text-sm">
								{errors.name.message?.toString()}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="birthdate">Birthdate</Label>
						<Input
							id="birthdate"
							type="date"
							{...register("birthdate", { required: "Birthdate is required" })}
						/>
						{errors.birthdate && (
							<p className="text-red-500 text-sm">
								{errors.birthdate.message?.toString()}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Gender</Label>
						<Select value={gender} onValueChange={handleGenderChange}>
							<SelectTrigger id="gender">
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
						<input type="hidden" {...register("gender")} value={gender} />
						{errors.gender && (
							<p className="text-red-500 text-sm">
								{errors.gender.message?.toString()}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
						>
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
