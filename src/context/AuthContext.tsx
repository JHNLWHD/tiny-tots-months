import { useToast } from "@/hooks/useToast.ts";
import { supabase } from "@/integrations/supabase/client";
import { trackAuthError } from "@/lib/analytics";
import type { Session, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	signUp: (email: string, password: string, fullName: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		// Set up auth state listener FIRST
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			setSession(newSession);
			setUser(newSession?.user ?? null);

			if (event === "SIGNED_IN") {
				toast({
					title: "Signed in successfully",
					description: "Welcome to Tiny Tots Milestones!",
				});
			} else if (event === "SIGNED_OUT") {
				toast({
					title: "Signed out",
					description: "You have been signed out successfully",
				});
			}
		});

		// THEN check for existing session
		supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, [toast]);

	const signUp = async (email: string, password: string, fullName: string) => {
		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { full_name: fullName },
				},
			});

			if (error) throw error;

			toast({
				title: "Account created",
				description: "Please check your email to confirm your account",
			});

			navigate("/app");
		} catch (error) {
			const authError = error instanceof Error ? error : new Error("Unknown signup error");
			trackAuthError(authError, "signup");
			
			toast({
				title: "Sign up failed",
				description: authError.message || "An error occurred during sign up",
				variant: "destructive",
			});
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;
			navigate("/app");
		} catch (error) {
			const authError = error instanceof Error ? error : new Error("Unknown signin error");
			trackAuthError(authError, "login");
			
			toast({
				title: "Sign in failed",
				description: authError.message || "Invalid email or password",
				variant: "destructive",
			});
		}
	};

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			navigate("/");
		} catch (error) {
			const authError = error instanceof Error ? error : new Error("Unknown signout error");
			trackAuthError(authError, "logout");
			
			toast({
				title: "Sign out failed",
				description: authError.message || "An error occurred during sign out",
				variant: "destructive",
			});
		}
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				user,
				loading,
				signUp,
				signIn,
				signOut,
				isAuthenticated: !!session,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
