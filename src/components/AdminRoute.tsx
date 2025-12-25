import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/lib/admin";
import { Navigate } from "react-router-dom";

type AdminRouteProps = {
	children: React.ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const isAdmin = useIsAdmin();

	if (authLoading) {
		return (
			<div className="min-h-screen joyful-gradient flex items-center justify-center">
				<div className="animate-pulse text-baby-purple">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth" replace />;
	}

	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="container mx-auto px-4 text-center">
					<div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
						<div className="text-red-500 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12 mx-auto"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Access Denied</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold mb-4">Access Denied</h2>
						<p className="text-gray-600 mb-6">
							You do not have permission to access this page. Admin access is required.
						</p>
						<button
							onClick={() => window.history.back()}
							className="px-4 py-2 bg-baby-purple text-white rounded hover:bg-baby-purple/90"
							type="button"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default AdminRoute;

