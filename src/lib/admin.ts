import { useAuth } from "@/context/AuthContext";

/**
 * Check if the current user is an admin
 * Admins are identified by user_metadata.is_admin === true
 */
export function isAdmin(user: { user_metadata?: Record<string, any> } | null): boolean {
	if (!user) return false;
	return user.user_metadata?.is_admin === true;
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
	const { user } = useAuth();
	return isAdmin(user);
}

/**
 * Require admin - throws error if user is not admin
 * Useful for components that should only render for admins
 */
export function requireAdmin(user: { user_metadata?: Record<string, any> } | null): void {
	if (!isAdmin(user)) {
		throw new Error("Admin access required");
	}
}

