import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AuthWrapper } from "@/context/AuthWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import {
	Navigate,
	Outlet,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { TrackingConsentBanner } from "./components/TrackingConsentBanner";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Month from "./pages/Month";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Settings from "./pages/Settings";
import TermsOfService from "./pages/TermsOfService";
import Upgrade from "./pages/Upgrade";

import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<Router>
					<AuthProvider>
						<AuthWrapper>
							<Routes>
								<Route path="/" element={<Landing />} />
								<Route path="/landing" element={<Navigate to="/" replace />} />
								<Route path="/auth" element={<Auth />} />

								{/* Legal and Support Pages - Moved outside protected routes */}
								<Route path="/privacy-policy" element={<PrivacyPolicy />} />
								<Route path="/terms-of-service" element={<TermsOfService />} />
								<Route path="/contact" element={<Contact />} />
								<Route path="/help" element={<Help />} />

								<Route
									path="/app"
									element={
										<ProtectedRoute>
											<Layout>
												<Outlet />
											</Layout>
										</ProtectedRoute>
									}
								>
									<Route index element={<Home />} />
									<Route path="month/:babyId/:monthId" element={<Month />} />
									<Route path="upgrade" element={<Upgrade />} />
									<Route path="settings" element={<Settings />} />
								</Route>

								<Route path="*" element={<NotFound />} />
							</Routes>
							<Toaster />
							
							{/* Tracking Consent Banner - Production Only */}
							<TrackingConsentBanner />
						</AuthWrapper>
					</AuthProvider>
				</Router>
			</HelmetProvider>
		</QueryClientProvider>
	);
}

export default App;
