import type React from "react";
import { createContext, useContext, useState } from "react";

// Passcode for photo uploads - read from environment variable
// Set VITE_BABY_JASMINE_PASSCODE in your .env file
const PHOTO_UPLOAD_PASSCODE = import.meta.env.VITE_BABY_JASMINE_PASSCODE || "jasmine2025";

type GuestPhotoAuthContextType = {
	isAuthenticated: boolean;
	guestName: string | null;
	passcode: string;
	setPasscode: (passcode: string) => void;
	verifyPasscode: (inputPasscode: string, name: string) => boolean;
	logout: () => void;
};

const GuestPhotoAuthContext = createContext<GuestPhotoAuthContextType | undefined>(undefined);

export const GuestPhotoAuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [passcode, setPasscode] = useState("");
	const [guestName, setGuestName] = useState<string | null>(null);

	const verifyPasscode = (inputPasscode: string, name: string): boolean => {
		if (inputPasscode === PHOTO_UPLOAD_PASSCODE) {
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

