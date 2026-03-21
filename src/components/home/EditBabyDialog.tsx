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
import type { Baby, UpdateBabyPayload } from "@/hooks/useBabyProfiles";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
} from "react";
import {
	Controller,
	useForm,
	type ControllerRenderProps,
} from "react-hook-form";
import { toast } from "sonner";

/** DB / legacy values may not match Radix `SelectItem` values (lowercase). */
function genderToSelectValue(g: string | null | undefined): string {
	if (g == null || g === "") return "other";
	const v = g.trim().toLowerCase();
	if (v === "male" || v === "female" || v === "other") return v;
	return "other";
}

type EditBabyDialogProps = {
	baby: Baby | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	updateBaby: (
		babyId: string,
		payload: UpdateBabyPayload,
		options?: { onSuccess?: () => void; onError?: (err: Error) => void },
	) => void;
};

type EditBabyFormValues = {
	name: string;
	birthdate: string;
	gender: string;
};

function validateBirthdateNotFuture(v: string) {
	if (!v) return true;
	const d = new Date(v);
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	return d <= today || "Birthdate cannot be in the future";
}

/**
 * Form + header only — parent must wrap in `<Dialog><DialogContent>`.
 */
function EditBabyDialog({
	baby,
	open,
	onOpenChange,
	updateBaby,
}: EditBabyDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [genderOpen, setGenderOpen] = useState(false);
	const [selectPortalContainer, setSelectPortalContainer] =
		useState<HTMLElement | null>(null);

	const formContainerRef = useCallback((node: HTMLFormElement | null) => {
		setSelectPortalContainer(node);
	}, []);

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EditBabyFormValues>({
		defaultValues: {
			name: "",
			birthdate: "",
			gender: "other",
		},
	});

	function renderGenderField({
		field,
	}: {
		field: ControllerRenderProps<EditBabyFormValues, "gender">;
	}) {
		return (
			<Select
				open={genderOpen}
				onOpenChange={setGenderOpen}
				value={field.value}
				onValueChange={field.onChange}
			>
				<SelectTrigger id="edit-gender">
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
		);
	}

	function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		setPhotoFile(f ?? null);
	}

	useEffect(() => {
		if (!open) {
			setGenderOpen(false);
			reset();
			setPhotoFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}, [open, reset]);

	useEffect(() => {
		if (open && baby) {
			reset({
				name: baby.name,
				birthdate: baby.date_of_birth,
				gender: genderToSelectValue(baby.gender),
			});
			setPhotoFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}, [open, baby, reset]);

	function requestClose() {
		setGenderOpen(false);
		onOpenChange(false);
	}

	async function onSubmit(data: EditBabyFormValues) {
		if (!baby) return;

		try {
			await new Promise<void>((resolve, reject) => {
				updateBaby(
					baby.id,
					{
						name: data.name,
						dateOfBirth: data.birthdate,
						gender: data.gender,
						photoFile: photoFile ?? undefined,
						previousPhotoUrl: baby.photo_url,
					},
					{
						onSuccess: () => resolve(),
						onError: (err) => reject(err),
					},
				);
			});
			setGenderOpen(false);
			onOpenChange(false);
			setPhotoFile(null);
			toast.success(`${data.name}'s profile was updated.`);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to update profile",
			);
		}
	}

	return (
		<>
			<DialogHeader>
				<DialogTitle>Edit baby profile</DialogTitle>
			</DialogHeader>
			{baby && (
				<form
					ref={formContainerRef}
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 mt-4"
				>
					<div className="space-y-2">
						<Label htmlFor="edit-name">Baby&apos;s name</Label>
						<Input
							id="edit-name"
							placeholder="Name"
							{...register("name", { required: "Name is required" })}
						/>
						{errors.name && (
							<p className="text-red-500 text-sm">
								{errors.name.message?.toString()}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-birthdate">Birthdate</Label>
						<Input
							id="edit-birthdate"
							type="date"
							{...register("birthdate", {
								required: "Birthdate is required",
								validate: validateBirthdateNotFuture,
							})}
						/>
						{errors.birthdate && (
							<p className="text-red-500 text-sm">
								{errors.birthdate.message?.toString()}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-gender">Gender</Label>
						<Controller
							name="gender"
							control={control}
							render={renderGenderField}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-photo">Profile photo (optional)</Label>
						<Input
							id="edit-photo"
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
							onChange={handlePhotoChange}
						/>
						{photoFile && (
							<p className="text-sm text-muted-foreground">
								Selected: {photoFile.name}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button type="button" variant="outline" onClick={requestClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving…" : "Save changes"}
						</Button>
					</div>
				</form>
			)}
		</>
	);
}

export default EditBabyDialog;
