import { zodResolver } from "@hookform/resolvers/zod";
import { Baby, LogIn, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/BetaBadge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema
	.extend({
		fullName: z.string().min(2, "Full name must be at least 2 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
	const [activeTab, setActiveTab] = useState<"login" | "register">("login");
	const { signIn, signUp, isAuthenticated, loading } = useAuth();

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const registerForm = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			fullName: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleLogin = async (data: LoginFormValues) => {
		await signIn(data.email, data.password);
	};

	const handleRegister = async (data: RegisterFormValues) => {
		await signUp(data.email, data.password, data.fullName);
	};

	if (isAuthenticated && !loading) {
		return <Navigate to="/app" replace />;
	}

	return (
		<div className="min-h-screen joyful-gradient animate-fade-in flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<Baby
						size={48}
						className="mx-auto text-baby-purple mb-2 animate-bounce-soft"
					/>
					<div className="flex items-center justify-center gap-2 mb-2">
						<h1 className="text-3xl font-bold text-baby-purple">
							Tiny Tots Milestones
						</h1>
						<BetaBadge size="sm" />
					</div>
					<p className="text-gray-600">Capture every precious moment</p>
				</div>

				<Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
					<CardHeader className="space-y-1 pb-2">
						<CardTitle className="text-xl text-center">Welcome!</CardTitle>
						<CardDescription className="text-center">
							Sign in to your account or create a new one
						</CardDescription>
					</CardHeader>
					<Tabs
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as "login" | "register")
						}
						className="w-full"
					>
						<TabsList className="grid grid-cols-2 mb-2 mx-4">
							<TabsTrigger value="login">Login</TabsTrigger>
							<TabsTrigger value="register">Register</TabsTrigger>
						</TabsList>

						<TabsContent value="login">
							<CardContent className="pt-4">
								<Form {...loginForm}>
									<form
										onSubmit={loginForm.handleSubmit(handleLogin)}
										className="space-y-4"
									>
										<FormField
											control={loginForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input
															placeholder="Your email"
															type="email"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={loginForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Password</FormLabel>
													<FormControl>
														<Input
															placeholder="Your password"
															type="password"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="submit"
											className="w-full"
											disabled={loginForm.formState.isSubmitting}
										>
											<LogIn className="mr-2 h-4 w-4" />
											{loginForm.formState.isSubmitting
												? "Signing in..."
												: "Sign in"}
										</Button>
									</form>
								</Form>
							</CardContent>
						</TabsContent>

						<TabsContent value="register">
							<CardContent className="pt-4">
								<Form {...registerForm}>
									<form
										onSubmit={registerForm.handleSubmit(handleRegister)}
										className="space-y-4"
									>
										<FormField
											control={registerForm.control}
											name="fullName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Full Name</FormLabel>
													<FormControl>
														<Input placeholder="Your full name" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={registerForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input
															placeholder="Your email"
															type="email"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={registerForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Password</FormLabel>
													<FormControl>
														<Input
															placeholder="Your password"
															type="password"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={registerForm.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Confirm Password</FormLabel>
													<FormControl>
														<Input
															placeholder="Confirm password"
															type="password"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="submit"
											className="w-full"
											disabled={registerForm.formState.isSubmitting}
										>
											<UserRoundPlus className="mr-2 h-4 w-4" />
											{registerForm.formState.isSubmitting
												? "Creating account..."
												: "Create account"}
										</Button>
									</form>
								</Form>
							</CardContent>
						</TabsContent>

						<CardFooter className="flex flex-col space-y-2 pt-0">
							<div className="text-sm text-center text-gray-500 mt-3">
								<Link to="/" className="underline hover:text-baby-purple">
									Back to landing page
								</Link>
							</div>
						</CardFooter>
					</Tabs>
				</Card>
			</div>
		</div>
	);
};

export default Auth;
