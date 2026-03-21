import { Button } from "@/components/ui/button";
import {
	DialogHeader,
	DialogTitle,
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
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type AddBabyDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	createBaby: (data: {
		name: string;
		dateOfBirth: string;
		gender: string;
	}) => Promise<void>;
};

type AddBabyFormValues = {
	name: string;
	birthdate: string;
	gender: string;
};

/**
 * Form + header only — parent must wrap in `<Dialog><DialogContent>`.
 */
function AddBabyDialog({
	open,
	onOpenChange,
	createBaby,
}: AddBabyDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<AddBabyFormValues>({
		defaultValues: {
			name: "",
			birthdate: "",
			gender: "other",
		},
	});

	const gender = watch("gender");
	const [genderOpen, setGenderOpen] = useState(false);
	const [selectPortalContainer, setSelectPortalContainer] =
		useState<HTMLElement | null>(null);

	const formContainerRef = useCallback((node: HTMLFormElement | null) => {
		setSelectPortalContainer(node);
	}, []);

	function handleGenderChange(value: string) {
		setValue("gender", value, { shouldValidate: true });
	}

	function requestClose() {
		setGenderOpen(false);
		onOpenChange(false);
	}

	async function onSubmit(data: AddBabyFormValues) {
		try {
			await createBaby({
				name: data.name,
				dateOfBirth: data.birthdate,
				gender: data.gender,
			});
			reset();
			requestClose();
			toast.success(`${data.name} added successfully!`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);
			toast.error(`Failed to add baby: ${message}`);
		}
	}

	useEffect(() => {
		if (!open) {
			setGenderOpen(false);
			reset();
		}
	}, [open, reset]);

	return (
		<>
			<DialogHeader>
				<DialogTitle>Add a New Baby</DialogTitle>
			</DialogHeader>
			<form
				ref={formContainerRef}
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4 mt-4"
			>
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
					<Select
						open={genderOpen}
						onOpenChange={setGenderOpen}
						value={gender}
						onValueChange={handleGenderChange}
					>
						<SelectTrigger id="gender">
							<SelectValue placeholder="Select gender" />
						</SelectTrigger>
						<SelectContent
							container={selectPortalContainer}
							className="z-[100]"
						>
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
					<Button type="button" variant="outline" onClick={requestClose}>
						Cancel
					</Button>
					<Button type="submit">Add Baby</Button>
				</div>
			</form>
		</>
	);
}

export default AddBabyDialog;
