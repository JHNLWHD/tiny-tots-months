import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { Baby, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FormData = {
	name: string;
	birthdate: string;
	gender: string;
};

const Onboarding = () => {
	const navigate = useNavigate();
	const { babies, loading, createBaby } = useBabyProfiles();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		defaultValues: {
			name: "",
			birthdate: "",
			gender: "other",
		},
	});

	const gender = watch("gender");

	const handleGenderChange = (value: string) => {
		setValue("gender", value, { shouldValidate: true });
	};

	const onSubmit = async (data: FormData) => {
		createBaby(
			{
				name: data.name,
				dateOfBirth: data.birthdate,
				gender: data.gender,
			},
			{
				onSuccess: () => {
					toast.success(`Welcome! ${data.name}'s milestone journal is ready.`);
					navigate("/app");
				},
				onError: (error) => {
					toast.error(`Failed to create profile: ${error.message}`);
				},
			}
		);
	};

	// Show loading state
	if (loading) {
		return (
			<div className="min-h-screen joyful-gradient flex items-center justify-center">
				<div className="animate-pulse text-baby-purple">Loading...</div>
			</div>
		);
	}

	// Redirect users who already have babies back to /app
	if (babies.length > 0) {
		return <Navigate to="/app" replace />;
	}

	return (
		<div className="min-h-screen joyful-gradient flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				{/* Welcome Header */}
				<div className="text-center space-y-4">
					<div className="w-20 h-20 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto animate-float">
						<Baby className="h-10 w-10 text-baby-purple" />
					</div>
					<div className="space-y-2">
						<h1 className="text-3xl font-bold text-gray-800 font-heading">
							Welcome to Tiny Tots!
						</h1>
						<p className="text-gray-600">
							Let's set up your baby's milestone journal to start capturing precious memories.
						</p>
					</div>
				</div>

				{/* Baby Creation Form */}
				<Card className="shadow-lg border-baby-purple/20">
					<CardHeader className="text-center pb-2">
						<CardTitle className="flex items-center justify-center gap-2 text-xl">
							<Sparkles className="h-5 w-5 text-baby-purple" />
							Add Your Baby
						</CardTitle>
						<CardDescription>
							Tell us about your little one
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Baby's Name</Label>
								<Input
									id="name"
									placeholder="Enter baby's name"
									{...register("name", { required: "Name is required" })}
								/>
								{errors.name && (
									<p className="text-red-500 text-sm">
										{errors.name.message}
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
										{errors.birthdate.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="gender">Gender (optional)</Label>
								<Select value={gender} onValueChange={handleGenderChange}>
									<SelectTrigger id="gender">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="other">Prefer not to say</SelectItem>
									</SelectContent>
								</Select>
								<input type="hidden" {...register("gender")} value={gender} />
							</div>

							<Button
								type="submit"
								className="w-full bg-baby-purple hover:bg-baby-purple/90 mt-6"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Get Started"}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Footer Note */}
				<p className="text-center text-sm text-gray-500">
					You can add more babies later from the home page.
				</p>
			</div>
		</div>
	);
};

export default Onboarding;
