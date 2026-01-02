import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsMobile } from "@/hooks/useIsMobile.tsx";
import { cn } from "@/lib/utils";
import { BetaBadge } from "@/components/BetaBadge";
import { Baby, Home, LogOut, Menu, X, Settings as SettingsIcon, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

type LayoutProps = {
	children: React.ReactNode;
	hideHeader?: boolean;
};

const Layout = ({ children, hideHeader = false }: LayoutProps) => {
	const { user, signOut, isAuthenticated } = useAuth();
	const { creditsBalance } = useSubscription();
	const isMobile = useIsMobile();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-baby-purple/5 pb-12">
			{!hideHeader && (
				<header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
					<div className="container mx-auto py-3 px-4">
						<div className="flex items-center justify-between">
							<Link to="/" className="flex items-center group">
								<div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-baby-purple to-baby-blue rounded-full flex items-center justify-center mr-2 md:mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
									<Baby
										size={isMobile ? 18 : 24}
										className="text-white animate-bounce-soft"
									/>
								</div>
								<div className="flex items-center gap-2">
									<h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-baby-purple to-baby-blue font-heading">
										Tiny Tots Milestones
									</h1>
									<BetaBadge size="sm" />
								</div>
							</Link>

							{/* Mobile menu button and credits */}
							<div className="block md:hidden flex items-center gap-2">
								{isAuthenticated && (
									<>
										{/* Credits Display - Mobile */}
										<Badge 
											variant="outline" 
											className="flex items-center gap-1 px-2 py-1 bg-blue-50 border-blue-200 text-blue-700 font-medium text-xs"
										>
											<Zap className="h-3 w-3" />
											<span>{creditsBalance || 0}</span>
										</Badge>
										<Button
											variant="ghost"
											onClick={toggleMobileMenu}
											className="p-2 rounded-full hover:bg-gray-100"
											aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
										>
											{mobileMenuOpen ? (
												<X className="h-6 w-6 text-baby-purple" />
											) : (
												<Menu className="h-6 w-6 text-baby-purple" />
											)}
										</Button>
									</>
								)}
							</div>

							{/* Desktop navigation */}
							<div className="hidden md:flex items-center gap-4">
								{isAuthenticated ? (
									<>
										{/* User Context */}
										{user && (
											<div className="flex items-center gap-3 mr-4">
												<div className="w-8 h-8 bg-baby-purple/20 rounded-full flex items-center justify-center">
													<Baby className="h-4 w-4 text-baby-purple" />
												</div>
												<div className="text-sm">
													<div className="font-medium text-gray-800">Welcome back!</div>
													<div className="text-gray-500 truncate max-w-[150px]">{user.email}</div>
												</div>
											</div>
										)}

										{/* Credits Display */}
										{isAuthenticated && (
											<Badge 
												variant="outline" 
												className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-blue-200 text-blue-700 font-medium"
											>
												<Zap className="h-3.5 w-3.5" />
												<span>{creditsBalance || 0} Credits</span>
											</Badge>
										)}

										{/* Primary Navigation */}
										<Link
											to="/app"
											className="px-4 py-2 bg-baby-purple text-white hover:bg-baby-purple/90 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center"
										>
											<Home className="mr-2 h-4 w-4" />
											<span>App</span>
										</Link>

										{/* Secondary Actions */}
										<div className="flex items-center gap-2">
											<Link
												to="/app/settings"
												className="p-2 text-gray-600 hover:text-baby-purple hover:bg-baby-purple/10 rounded-full transition-all duration-200 hover:scale-105"
												title="Settings"
											>
												<SettingsIcon className="h-5 w-5" />
											</Link>
											<Button
												variant="ghost"
												onClick={signOut}
												className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-105"
												title="Sign out"
											>
												<LogOut className="h-5 w-5" />
											</Button>
										</div>
									</>
								) : (
									<>
										<Link
											to="/auth"
											className="px-4 py-2 text-baby-purple hover:text-baby-purple/80 font-medium transition-colors"
										>
											Sign in
										</Link>
										<Link
											to="/auth"
											className="px-6 py-2 bg-baby-purple text-white hover:bg-baby-purple/90 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
										>
											Get Started
										</Link>
									</>
								)}
							</div>
						</div>

						{/* Enhanced Mobile menu */}
						{isAuthenticated && (
							<div
								className={cn(
									"md:hidden overflow-hidden transition-all duration-300 ease-in-out",
									mobileMenuOpen
										? "max-h-80 opacity-100 mt-4"
										: "max-h-0 opacity-0",
								)}
							>
								<div className="py-4 flex flex-col gap-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-baby-purple/20">
									{/* User Info */}
									{user && (
										<div className="px-4 py-3 bg-gradient-to-r from-baby-purple/5 to-baby-blue/5 rounded-lg mx-3 border border-baby-purple/20">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-baby-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
													<Baby className="h-5 w-5 text-baby-purple" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium text-gray-800">Welcome back!</div>
													<div className="text-sm text-gray-500 truncate">{user.email}</div>
												</div>
											</div>
										</div>
									)}

									{/* Navigation Links */}
									<div className="px-2 space-y-1">
										<Link
											to="/app"
											className="flex items-center px-4 py-3 text-baby-purple hover:bg-baby-purple/10 rounded-lg transition-colors"
											onClick={() => setMobileMenuOpen(false)}
										>
											<Home className="mr-3 h-5 w-5" />
											<span className="font-medium">App</span>
										</Link>
										<Link
											to="/app/settings"
											className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
											onClick={() => setMobileMenuOpen(false)}
										>
											<SettingsIcon className="mr-3 h-5 w-5" />
											<span className="font-medium">Settings</span>
										</Link>
									</div>

									{/* Sign Out */}
									<div className="px-2 pt-2 border-t border-gray-200 mx-3">
										<Button
											variant="ghost"
											onClick={() => {
												setMobileMenuOpen(false);
												signOut();
											}}
											className="w-full flex items-center justify-start px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
										>
											<LogOut className="mr-3 h-5 w-5" />
											<span className="font-medium">Sign out</span>
										</Button>
									</div>
								</div>
							</div>
						)}
					</div>
				</header>
			)}

			<main className="container mx-auto px-3 md:px-4 py-4 md:py-6 animate-fade-in">
				{children}
			</main>
		</div>
	);
};

export default Layout;
