import type React from "react";
import { createContext, useContext, useState, useMemo } from "react";

type GuestPhotoAuthContextType = {
	isAuthenticated: boolean;
	guestName: string | null;
	passcode: string;
	setPasscode: (passcode: string) => void;
	verifyPasscode: (inputPasscode: string, name: string) => boolean;
	logout: () => void;
};

const GuestPhotoAuthContext = createContext<GuestPhotoAuthContextType | undefined>(undefined);

type GuestPhotoAuthProviderProps = {
	children: React.ReactNode;
	passcodeEnvVar?: string; // Environment variable name for passcode (e.g., "VITE_BABY_JASMINE_PASSCODE")
	defaultPasscode?: string; // Default passcode if env var is not set
};

export const GuestPhotoAuthProvider = ({ 
	children, 
	passcodeEnvVar = "VITE_BABY_JASMINE_PASSCODE",
	defaultPasscode = "jasmine2025"
}: GuestPhotoAuthProviderProps) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [passcode, setPasscode] = useState("");
	const [guestName, setGuestName] = useState<string | null>(null);

	// Read passcode from environment variable
	const photoUploadPasscode = useMemo(() => {
		const envValue = import.meta.env[passcodeEnvVar];
		return envValue || defaultPasscode;
	}, [passcodeEnvVar, defaultPasscode]);

	const verifyPasscode = (inputPasscode: string, name: string): boolean => {
		if (inputPasscode === photoUploadPasscode) {
			setIsAuthenticated(true);
			setPasscode(inputPasscode);
			setGuestName(name.trim() || null);
			return true;
		}
		return false;
	};

	const logout = () => {
		setIsAuthenticated(false);
		setPasscode("");
		setGuestName(null);
	};

	return (
		<GuestPhotoAuthContext.Provider
			value={{
				isAuthenticated,
				guestName,
				passcode,
				setPasscode,
				verifyPasscode,
				logout,
			}}
		>
			{children}
		</GuestPhotoAuthContext.Provider>
	);
};

export const useGuestPhotoAuth = () => {
	const context = useContext(GuestPhotoAuthContext);
	if (context === undefined) {
		throw new Error("useGuestPhotoAuth must be used within a GuestPhotoAuthProvider");
	}
	return context;
};

