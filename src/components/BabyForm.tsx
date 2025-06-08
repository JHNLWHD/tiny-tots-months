import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	name: z.string().min(1, "Baby's name is required"),
	dateOfBirth: z
		.date({
			required_error: "Date of birth is required",
		})
		.refine((date) => date <= new Date(), {
			message: "Date of birth cannot be in the future",
		}),
});

type FormValues = z.infer<typeof formSchema>;

interface BabyFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

const BabyForm = ({ isOpen, onClose, onSuccess }: BabyFormProps) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
		},
	});

	const createBabyMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			if (!user) throw new Error("User not authenticated");

			const { data, error } = await supabase
				.from("baby")
				.insert({
					name: values.name,
					date_of_birth: format(values.dateOfBirth, "yyyy-MM-dd"),
					user_id: user.id,
				})
				.select()
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: (data, variables) => {
			toast("Success!", {
				description: `${variables.name}'s profile has been created.`,
			});

			queryClient.invalidateQueries({ queryKey: ["babies", user?.id] });
			form.reset();
			onClose();
			if (onSuccess) onSuccess();
		},
		onError: (error) => {
			toast("Error", {
				description: error.message || "Failed to create baby profile",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	const handleSubmit = (values: FormValues) => {
		createBabyMutation.mutate(values);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="text-center text-xl font-bold">
						Add New Baby
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6 pt-2"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Baby's Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter baby's name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dateOfBirth"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Date of Birth</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														"pl-3 text-left font-normal",
														!field.value && "text-muted-foreground",
													)}
												>
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date > new Date()}
												initialFocus
												className={cn("p-3 pointer-events-auto")}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-3 pt-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={createBabyMutation.isPending}>
								{createBabyMutation.isPending
									? "Creating..."
									: "Create Profile"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default BabyForm;
