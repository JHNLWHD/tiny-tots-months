import { Card, CardContent } from "@/components/ui/card";
import GuestPhotoGallery from "@/components/GuestPhotoGallery";
import GuestPhotoUpload from "@/components/GuestPhotoUpload";
import { GuestPhotoAuthProvider } from "@/context/GuestPhotoAuthContext";
import {
	Calendar,
	Clock,
	MapPin,
	Navigation,
	Shirt,
	UtensilsCrossed,
} from "lucide-react";
import type React from "react";
import { Helmet } from "react-helmet-async";

const BabyJasmineBinyag = () => {
	return (
		<GuestPhotoAuthProvider>
			<Helmet>
				<title>Baby Jasmine Binyag - December 28, 2025</title>
				<meta
					name="description"
					content="You're invited to Baby Jasmine's Binyag on December 28, 2025 at Our Lady of Fatima Chapel (WESMINCOM). Reception at Vista del Mar Resort and Recreation Center. Join us for this special celebration!"
				/>
				<meta
					name="keywords"
					content="Baby Jasmine, Binyag, baptism, December 2025, Our Lady of Fatima Chapel, Vista del Mar Resort, celebration, invitation"
				/>

				{/* Open Graph tags for social sharing - override index.html */}
				<meta
					property="og:title"
					content="Baby Jasmine Binyag - December 28, 2025"
				/>
				<meta
					property="og:description"
					content="You're invited to Baby Jasmine's Binyag on December 28, 2025 at Our Lady of Fatima Chapel (WESMINCOM). Reception at Vista del Mar Resort and Recreation Center."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={window.location.href} />
				<meta
					property="og:image"
					content={`${window.location.origin}/baby-jasmine-sticker.png`}
				/>
				<meta property="og:image:alt" content="Baby Jasmine" />

				{/* Twitter Card data - override index.html (using both name and property to ensure override) */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="Baby Jasmine Binyag - December 28, 2025"
				/>
				<meta
					property="twitter:title"
					content="Baby Jasmine Binyag - December 28, 2025"
				/>
				<meta
					name="twitter:description"
					content="You're invited to Baby Jasmine's Binyag on December 28, 2025 at Our Lady of Fatima Chapel (WESMINCOM). Reception at Vista del Mar Resort and Recreation Center."
				/>
				<meta
					property="twitter:description"
					content="You're invited to Baby Jasmine's Binyag on December 28, 2025 at Our Lady of Fatima Chapel (WESMINCOM). Reception at Vista del Mar Resort and Recreation Center."
				/>
				<meta
					name="twitter:url"
					content={window.location.href}
				/>
				<meta
					property="twitter:url"
					content={window.location.href}
				/>
				<meta
					name="twitter:image"
					content={`${window.location.origin}/baby-jasmine-sticker.png`}
				/>
				<meta
					property="twitter:image"
					content={`${window.location.origin}/baby-jasmine-sticker.png`}
				/>
				<meta name="twitter:image:alt" content="Baby Jasmine" />
				<meta property="twitter:image:alt" content="Baby Jasmine" />

				{/* Canonical URL - override index.html */}
				<link rel="canonical" href={window.location.href} />
			</Helmet>

			<div className="min-h-screen relative overflow-hidden" style={{
				background: 'linear-gradient(135deg, #fefefe 0%, #f9f7f5 50%, #f5f3f0 100%)',
			}}>
				{/* Decorative Background Elements */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{/* Gold accent splashes */}
				<div className="absolute top-0 left-0 w-64 h-64 opacity-20" style={{
					background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
					transform: 'translate(-30%, -30%)',
				}}></div>
				<div className="absolute bottom-0 left-0 w-96 h-96 opacity-15" style={{
					background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 70%)',
					transform: 'translate(-20%, 20%)',
				}}></div>
				<div className="absolute bottom-0 right-0 w-80 h-80 opacity-20" style={{
					background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
					transform: 'translate(20%, 20%)',
				}}></div>
				{/* Marble texture overlay */}
				<div className="absolute inset-0 opacity-[0.03]" style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
				}}></div>

				{/* Floating Balloons */}
				<div className="absolute top-4 left-2 md:top-10 md:left-10 animate-float" style={{ animationDuration: '6s' }}>
					<svg width="50" height="65" viewBox="0 0 60 80" className="opacity-70 md:opacity-60 md:w-[60px] md:h-[80px]">
						<ellipse cx="30" cy="35" rx="25" ry="30" fill="#6a3be4" opacity="0.8"/>
						<path d="M30 65 L25 80 M30 65 L35 80" stroke="#6a3be4" strokeWidth="2" opacity="0.6"/>
					</svg>
				</div>
				<div className="absolute top-8 right-2 md:top-20 md:right-20 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
					<svg width="45" height="60" viewBox="0 0 50 70" className="opacity-65 md:opacity-50 md:w-[50px] md:h-[70px]">
						<ellipse cx="25" cy="30" rx="20" ry="25" fill="#8b5cf6" opacity="0.7"/>
						<path d="M25 55 L20 70 M25 55 L30 70" stroke="#8b5cf6" strokeWidth="2" opacity="0.5"/>
					</svg>
				</div>
				<div className="absolute bottom-16 left-2 md:bottom-20 md:left-20 animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>
					<svg width="48" height="65" viewBox="0 0 55 75" className="opacity-70 md:opacity-55 md:w-[55px] md:h-[75px]">
						<ellipse cx="27" cy="32" rx="22" ry="28" fill="#a78bfa" opacity="0.75"/>
						<path d="M27 60 L22 75 M27 60 L32 75" stroke="#a78bfa" strokeWidth="2" opacity="0.55"/>
					</svg>
				</div>
				<div className="absolute bottom-4 right-2 md:bottom-10 md:right-10 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }}>
					<svg width="40" height="55" viewBox="0 0 45 65" className="opacity-65 md:opacity-50 md:w-[45px] md:h-[65px]">
						<ellipse cx="22" cy="28" rx="18" ry="23" fill="#c4b5fd" opacity="0.7"/>
						<path d="M22 51 L18 65 M22 51 L26 65" stroke="#c4b5fd" strokeWidth="2" opacity="0.5"/>
					</svg>
				</div>

				{/* Decorative Flowers */}
				<div className="absolute top-24 right-2 md:top-32 md:right-32 opacity-50 md:opacity-40" style={{ transform: 'rotate(-15deg)' }}>
					<svg width="32" height="32" viewBox="0 0 40 40" className="md:w-10 md:h-10">
						<circle cx="20" cy="20" r="8" fill="#6a3be4" opacity="0.5"/>
						<circle cx="12" cy="12" r="5" fill="#8b5cf6" opacity="0.4"/>
						<circle cx="28" cy="12" r="5" fill="#8b5cf6" opacity="0.4"/>
						<circle cx="12" cy="28" r="5" fill="#8b5cf6" opacity="0.4"/>
						<circle cx="28" cy="28" r="5" fill="#8b5cf6" opacity="0.4"/>
					</svg>
				</div>
				<div className="absolute bottom-24 left-2 md:bottom-32 md:left-32 opacity-45 md:opacity-35" style={{ transform: 'rotate(20deg)' }}>
					<svg width="28" height="28" viewBox="0 0 35 35" className="md:w-[35px] md:h-[35px]">
						<circle cx="17" cy="17" r="7" fill="#a78bfa" opacity="0.45"/>
						<circle cx="10" cy="10" r="4" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="24" cy="10" r="4" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="10" cy="24" r="4" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="24" cy="24" r="4" fill="#c4b5fd" opacity="0.4"/>
					</svg>
				</div>
				<div className="absolute top-1/2 left-2 md:top-1/2 md:left-10 opacity-40 md:opacity-30" style={{ transform: 'rotate(10deg)' }}>
					<svg width="24" height="24" viewBox="0 0 30 30" className="md:w-[30px] md:h-[30px]">
						<circle cx="15" cy="15" r="6" fill="#6a3be4" opacity="0.4"/>
						<circle cx="9" cy="9" r="4" fill="#8b5cf6" opacity="0.35"/>
						<circle cx="21" cy="9" r="4" fill="#8b5cf6" opacity="0.35"/>
						<circle cx="9" cy="21" r="4" fill="#8b5cf6" opacity="0.35"/>
						<circle cx="21" cy="21" r="4" fill="#8b5cf6" opacity="0.35"/>
					</svg>
				</div>
				<div className="absolute top-1/3 right-2 md:top-1/3 md:right-16 opacity-50 md:opacity-40" style={{ transform: 'rotate(-25deg)' }}>
					<svg width="30" height="30" viewBox="0 0 38 38" className="md:w-[38px] md:h-[38px]">
						<circle cx="19" cy="19" r="7" fill="#a78bfa" opacity="0.5"/>
						<circle cx="12" cy="12" r="5" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="26" cy="12" r="5" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="12" cy="26" r="5" fill="#c4b5fd" opacity="0.4"/>
						<circle cx="26" cy="26" r="5" fill="#c4b5fd" opacity="0.4"/>
					</svg>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative z-10">
				{/* Elegant Invitation Card */}
				<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
					boxShadow: '0 20px 60px rgba(106, 59, 228, 0.15), 0 0 0 1px rgba(106, 59, 228, 0.05)',
				}}>
					{/* Decorative corner flowers */}
					<div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-30 md:opacity-20">
						<svg viewBox="0 0 100 100" className="w-full h-full">
							<circle cx="50" cy="50" r="12" fill="#6a3be4" opacity="0.5"/>
							<circle cx="30" cy="30" r="8" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="70" cy="30" r="8" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="30" cy="70" r="8" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="70" cy="70" r="8" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="50" cy="20" r="6" fill="#a78bfa" opacity="0.35"/>
							<circle cx="80" cy="50" r="6" fill="#a78bfa" opacity="0.35"/>
							<circle cx="50" cy="80" r="6" fill="#a78bfa" opacity="0.35"/>
							<circle cx="20" cy="50" r="6" fill="#a78bfa" opacity="0.35"/>
						</svg>
					</div>
					<div className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 opacity-30 md:opacity-20">
						<svg viewBox="0 0 100 100" className="w-full h-full">
							<circle cx="50" cy="50" r="14" fill="#6a3be4" opacity="0.5"/>
							<circle cx="28" cy="28" r="9" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="72" cy="28" r="9" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="28" cy="72" r="9" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="72" cy="72" r="9" fill="#8b5cf6" opacity="0.4"/>
							<circle cx="50" cy="18" r="7" fill="#a78bfa" opacity="0.35"/>
							<circle cx="82" cy="50" r="7" fill="#a78bfa" opacity="0.35"/>
							<circle cx="50" cy="82" r="7" fill="#a78bfa" opacity="0.35"/>
							<circle cx="18" cy="50" r="7" fill="#a78bfa" opacity="0.35"/>
						</svg>
					</div>
					{/* Small balloons in corners */}
					<div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-40 md:opacity-30">
						<svg width="28" height="40" viewBox="0 0 35 50" className="md:w-[35px] md:h-[50px]">
							<ellipse cx="17" cy="20" rx="15" ry="18" fill="#c4b5fd" opacity="0.6"/>
							<path d="M17 38 L14 50 M17 38 L20 50" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5"/>
						</svg>
					</div>
					<div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 opacity-40 md:opacity-30">
						<svg width="24" height="36" viewBox="0 0 30 45" className="md:w-[30px] md:h-[45px]">
							<ellipse cx="15" cy="18" rx="13" ry="16" fill="#a78bfa" opacity="0.6"/>
							<path d="M15 34 L12 45 M15 34 L18 45" stroke="#a78bfa" strokeWidth="1.5" opacity="0.5"/>
						</svg>
					</div>

					<div className="p-8 md:p-16 relative">
						{/* Header Section */}
						<div className="text-center mb-12 relative">
							{/* Decorative flowers around header */}
							<div className="absolute -left-4 top-4 md:-left-8 md:top-8 opacity-40 md:opacity-30 animate-float" style={{ animationDuration: '5s' }}>
								<svg width="20" height="20" viewBox="0 0 25 25" className="md:w-[25px] md:h-[25px]">
									<circle cx="12" cy="12" r="5" fill="#6a3be4" opacity="0.5"/>
									<circle cx="7" cy="7" r="3" fill="#8b5cf6" opacity="0.4"/>
									<circle cx="17" cy="7" r="3" fill="#8b5cf6" opacity="0.4"/>
									<circle cx="7" cy="17" r="3" fill="#8b5cf6" opacity="0.4"/>
									<circle cx="17" cy="17" r="3" fill="#8b5cf6" opacity="0.4"/>
								</svg>
							</div>
							<div className="absolute -right-4 top-6 md:-right-8 md:top-12 opacity-40 md:opacity-30 animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}>
								<svg width="18" height="18" viewBox="0 0 22 22" className="md:w-[22px] md:h-[22px]">
									<circle cx="11" cy="11" r="4" fill="#a78bfa" opacity="0.5"/>
									<circle cx="6" cy="6" r="2.5" fill="#c4b5fd" opacity="0.4"/>
									<circle cx="16" cy="6" r="2.5" fill="#c4b5fd" opacity="0.4"/>
									<circle cx="6" cy="16" r="2.5" fill="#c4b5fd" opacity="0.4"/>
									<circle cx="16" cy="16" r="2.5" fill="#c4b5fd" opacity="0.4"/>
								</svg>
							</div>

							{/* Baby Jasmine Image */}
							<div className="mb-8 flex justify-center">
								<div className="relative">
									{/* Sparkles around image */}
									<div className="absolute -top-4 -left-4 w-3 h-3 bg-baby-purple/40 rounded-full animate-pulse"></div>
									<div className="absolute -top-2 -right-6 w-2 h-2 bg-baby-purple/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
									<div className="absolute -bottom-4 -left-2 w-2.5 h-2.5 bg-baby-purple/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
									<div className="absolute -bottom-2 -right-4 w-3 h-3 bg-baby-purple/50 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
									<div className="absolute inset-0 bg-gradient-to-br from-baby-purple/20 to-baby-purple/5 rounded-full blur-2xl"></div>
									<img
										src="/baby-jasmine-sticker.png"
										alt="Baby Jasmine"
										className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl animate-fade-in"
									/>
								</div>
							</div>
							<p className="text-lg md:text-xl text-baby-purple/90 mb-4 font-serif italic tracking-wide">
								Baby Jasmine invites you
							</p>
							<h1 className="text-5xl md:text-6xl font-bold text-baby-purple mb-6 font-heading tracking-tight relative" style={{
								textShadow: '0 2px 10px rgba(106, 59, 228, 0.1)',
							}}>
								{/* Small balloons around title */}
								<span className="absolute -left-6 top-0 md:-left-12 opacity-50 md:opacity-40">
									<svg width="16" height="22" viewBox="0 0 20 28" className="md:w-5 md:h-7">
										<ellipse cx="10" cy="12" rx="8" ry="10" fill="#c4b5fd" opacity="0.6"/>
										<path d="M10 22 L8 28 M10 22 L12 28" stroke="#c4b5fd" strokeWidth="1" opacity="0.5"/>
									</svg>
								</span>
								<span className="absolute -right-6 top-2 md:-right-12 opacity-50 md:opacity-40">
									<svg width="14" height="20" viewBox="0 0 18 26" className="md:w-[18px] md:h-[26px]">
										<ellipse cx="9" cy="11" rx="7" ry="9" fill="#a78bfa" opacity="0.6"/>
										<path d="M9 20 L7 26 M9 20 L11 26" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
									</svg>
								</span>
								Binyag
							</h1>
							<div className="flex items-center justify-center gap-4 mb-6">
								<div className="w-16 h-px bg-gradient-to-r from-transparent via-baby-purple/40 to-baby-purple/40"></div>
								{/* Small flower in divider */}
								<div className="relative">
									<div className="w-2 h-2 rounded-full bg-baby-purple/40"></div>
									<div className="absolute inset-0 flex items-center justify-center">
										<svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60">
											<circle cx="4" cy="4" r="1.5" fill="#6a3be4"/>
											<circle cx="2" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
											<circle cx="6" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
											<circle cx="2" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
											<circle cx="6" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
										</svg>
									</div>
								</div>
								<div className="w-16 h-px bg-gradient-to-l from-transparent via-baby-purple/40 to-baby-purple/40"></div>
							</div>
						</div>

						{/* Main Content */}
						<div className="space-y-10 relative">
							{/* Decorative elements scattered throughout content */}
							<div className="absolute left-0 top-8 opacity-30 animate-float" style={{ animationDuration: '7s' }}>
								<svg width="18" height="18" viewBox="0 0 22 22" className="md:w-[22px] md:h-[22px]">
									<circle cx="11" cy="11" r="4" fill="#a78bfa" opacity="0.4"/>
									<circle cx="6" cy="6" r="2.5" fill="#c4b5fd" opacity="0.3"/>
									<circle cx="16" cy="6" r="2.5" fill="#c4b5fd" opacity="0.3"/>
									<circle cx="6" cy="16" r="2.5" fill="#c4b5fd" opacity="0.3"/>
									<circle cx="16" cy="16" r="2.5" fill="#c4b5fd" opacity="0.3"/>
								</svg>
							</div>
							<div className="absolute right-0 top-12 opacity-35 animate-float" style={{ animationDuration: '6s', animationDelay: '1.5s' }}>
								<svg width="20" height="28" viewBox="0 0 20 28" className="md:w-5 md:h-7">
									<ellipse cx="10" cy="12" rx="8" ry="10" fill="#c4b5fd" opacity="0.5"/>
									<path d="M10 22 L8 28 M10 22 L12 28" stroke="#c4b5fd" strokeWidth="1" opacity="0.4"/>
								</svg>
							</div>

							{/* Date & Time */}
							<div className="text-center relative">
								{/* Small sparkles around date */}
								<div className="absolute -left-2 top-0 w-2 h-2 bg-baby-purple/40 rounded-full animate-pulse"></div>
								<div className="absolute -right-2 top-4 w-1.5 h-1.5 bg-baby-purple/50 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
								<div className="inline-flex items-center gap-3 mb-3">
									<Calendar className="h-5 w-5 text-baby-purple" />
									<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Date & Time
									</h3>
								</div>
								<p className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">
									December 28, 2025
								</p>
								<div className="flex items-center justify-center gap-2 text-gray-600">
									<Clock className="h-4 w-4 text-baby-purple" />
									<p className="text-lg">9:00 AM</p>
								</div>
							</div>

							<div className="flex items-center justify-center gap-4 my-8 relative">
								{/* Small flowers on divider */}
								<div className="absolute left-1/4 opacity-30">
									<svg width="12" height="12" viewBox="0 0 12 12">
										<circle cx="6" cy="6" r="2" fill="#6a3be4" opacity="0.4"/>
										<circle cx="3" cy="3" r="1.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="9" cy="3" r="1.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="3" cy="9" r="1.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="9" cy="9" r="1.5" fill="#8b5cf6" opacity="0.3"/>
									</svg>
								</div>
								<div className="absolute right-1/4 opacity-30">
									<svg width="12" height="12" viewBox="0 0 12 12">
										<circle cx="6" cy="6" r="2" fill="#a78bfa" opacity="0.4"/>
										<circle cx="3" cy="3" r="1.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="9" cy="3" r="1.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="3" cy="9" r="1.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="9" cy="9" r="1.5" fill="#c4b5fd" opacity="0.3"/>
									</svg>
								</div>
								<div className="w-24 h-px bg-gradient-to-r from-transparent via-baby-purple/20 to-baby-purple/20"></div>
								<div className="relative">
									<div className="w-1 h-1 rounded-full bg-baby-purple/30"></div>
									{/* Small flower in divider */}
									<svg width="8" height="8" viewBox="0 0 8 8" className="absolute -top-1 -left-1 opacity-50">
										<circle cx="4" cy="4" r="1.5" fill="#6a3be4"/>
										<circle cx="2" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="6" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="2" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="6" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
									</svg>
								</div>
								<div className="w-24 h-px bg-gradient-to-l from-transparent via-baby-purple/20 to-baby-purple/20"></div>
							</div>

							{/* Ceremony Location */}
							<div className="text-center relative">
								{/* Small balloon decoration */}
								<div className="absolute left-0 top-2 opacity-30 animate-float" style={{ animationDuration: '5s' }}>
									<svg width="16" height="22" viewBox="0 0 20 28" className="md:w-5 md:h-7">
										<ellipse cx="10" cy="12" rx="8" ry="10" fill="#a78bfa" opacity="0.5"/>
										<path d="M10 22 L8 28 M10 22 L12 28" stroke="#a78bfa" strokeWidth="1" opacity="0.4"/>
									</svg>
								</div>
								<div className="absolute right-0 top-0 opacity-25">
									<svg width="14" height="14" viewBox="0 0 14 14">
										<circle cx="7" cy="7" r="3" fill="#6a3be4" opacity="0.4"/>
										<circle cx="4" cy="4" r="2" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="10" cy="4" r="2" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="4" cy="10" r="2" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="10" cy="10" r="2" fill="#8b5cf6" opacity="0.3"/>
									</svg>
								</div>
								<div className="inline-flex items-center gap-3 mb-3">
									<MapPin className="h-5 w-5 text-baby-purple" />
									<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Ceremony
									</h3>
								</div>
								<p className="text-xl md:text-2xl font-serif text-gray-800 mb-4 leading-relaxed">
									OUR LADY OF FATIMA CHAPEL<br />
									<span className="text-lg text-gray-600">(WESMINCOM)</span>
								</p>
								<a
									href="https://maps.app.goo.gl/YXbJqchNWkccHXga6"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-baby-purple hover:text-baby-purple/80 font-medium transition-colors text-sm"
								>
									<Navigation className="h-4 w-4" />
									<span>Get Directions</span>
								</a>
							</div>

							<div className="flex items-center justify-center gap-4 my-8 relative">
								{/* Sparkles on divider */}
								<div className="absolute left-1/3 w-1.5 h-1.5 bg-baby-purple/40 rounded-full animate-pulse"></div>
								<div className="absolute right-1/3 w-1 h-1 bg-baby-purple/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
								<div className="w-24 h-px bg-gradient-to-r from-transparent via-baby-purple/20 to-baby-purple/20"></div>
								<div className="relative">
									<div className="w-1 h-1 rounded-full bg-baby-purple/30"></div>
									<svg width="8" height="8" viewBox="0 0 8 8" className="absolute -top-1 -left-1 opacity-50">
										<circle cx="4" cy="4" r="1.5" fill="#a78bfa"/>
										<circle cx="2" cy="2" r="1" fill="#c4b5fd" opacity="0.7"/>
										<circle cx="6" cy="2" r="1" fill="#c4b5fd" opacity="0.7"/>
										<circle cx="2" cy="6" r="1" fill="#c4b5fd" opacity="0.7"/>
										<circle cx="6" cy="6" r="1" fill="#c4b5fd" opacity="0.7"/>
									</svg>
								</div>
								<div className="w-24 h-px bg-gradient-to-l from-transparent via-baby-purple/20 to-baby-purple/20"></div>
							</div>

							{/* Reception */}
							<div className="text-center relative">
								{/* Decorative elements around reception */}
								<div className="absolute -left-3 top-4 opacity-30">
									<svg width="14" height="20" viewBox="0 0 18 26" className="md:w-[18px] md:h-[26px]">
										<ellipse cx="9" cy="11" rx="7" ry="9" fill="#c4b5fd" opacity="0.5"/>
										<path d="M9 20 L7 26 M9 20 L11 26" stroke="#c4b5fd" strokeWidth="1" opacity="0.4"/>
									</svg>
								</div>
								<div className="absolute -right-3 top-2 opacity-35 animate-float" style={{ animationDuration: '6s', animationDelay: '2s' }}>
									<svg width="16" height="16" viewBox="0 0 16 16">
										<circle cx="8" cy="8" r="3.5" fill="#6a3be4" opacity="0.4"/>
										<circle cx="5" cy="5" r="2.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="11" cy="5" r="2.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="5" cy="11" r="2.5" fill="#8b5cf6" opacity="0.3"/>
										<circle cx="11" cy="11" r="2.5" fill="#8b5cf6" opacity="0.3"/>
									</svg>
								</div>
								<div className="absolute left-1/2 -top-2 transform -translate-x-1/2 opacity-25">
									<div className="w-2 h-2 bg-baby-purple/40 rounded-full animate-pulse"></div>
								</div>
								<div className="inline-flex items-center gap-3 mb-3">
									<UtensilsCrossed className="h-5 w-5 text-baby-purple" />
									<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Reception
									</h3>
								</div>
								<p className="text-xl md:text-2xl font-serif text-gray-800 mb-4 leading-relaxed">
									Vista del Mar Resort<br />
									and Recreation Center
								</p>
								<div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
									<Clock className="h-4 w-4 text-baby-purple" />
									<p className="text-lg">11:00 AM</p>
								</div>
								<a
									href="https://maps.app.goo.gl/6ZmkDbodDquQXXQc7"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-baby-purple hover:text-baby-purple/80 font-medium transition-colors text-sm"
								>
									<Navigation className="h-4 w-4" />
									<span>Get Directions</span>
								</a>
							</div>

							<div className="flex items-center justify-center gap-4 my-8 relative">
								{/* More decorative elements */}
								<div className="absolute left-1/4 opacity-25">
									<div className="w-1.5 h-1.5 bg-baby-purple/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
								</div>
								<div className="absolute right-1/4 opacity-25">
									<div className="w-1 h-1 bg-baby-purple/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
								</div>
								<div className="w-24 h-px bg-gradient-to-r from-transparent via-baby-purple/20 to-baby-purple/20"></div>
								<div className="relative">
									<div className="w-1 h-1 rounded-full bg-baby-purple/30"></div>
									<svg width="8" height="8" viewBox="0 0 8 8" className="absolute -top-1 -left-1 opacity-50">
										<circle cx="4" cy="4" r="1.5" fill="#6a3be4"/>
										<circle cx="2" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="6" cy="2" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="2" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
										<circle cx="6" cy="6" r="1" fill="#8b5cf6" opacity="0.7"/>
									</svg>
								</div>
								<div className="w-24 h-px bg-gradient-to-l from-transparent via-baby-purple/20 to-baby-purple/20"></div>
							</div>

							{/* Dress Code */}
							<div className="text-center relative">
								{/* Final decorative elements */}
								<div className="absolute left-0 bottom-0 opacity-30 animate-float" style={{ animationDuration: '5s', animationDelay: '3s' }}>
									<svg width="18" height="18" viewBox="0 0 22 22" className="md:w-[22px] md:h-[22px]">
										<circle cx="11" cy="11" r="4" fill="#a78bfa" opacity="0.4"/>
										<circle cx="6" cy="6" r="2.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="16" cy="6" r="2.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="6" cy="16" r="2.5" fill="#c4b5fd" opacity="0.3"/>
										<circle cx="16" cy="16" r="2.5" fill="#c4b5fd" opacity="0.3"/>
									</svg>
								</div>
								<div className="absolute right-0 bottom-0 opacity-35">
									<svg width="16" height="22" viewBox="0 0 20 28" className="md:w-5 md:h-7">
										<ellipse cx="10" cy="12" rx="8" ry="10" fill="#c4b5fd" opacity="0.5"/>
										<path d="M10 22 L8 28 M10 22 L12 28" stroke="#c4b5fd" strokeWidth="1" opacity="0.4"/>
									</svg>
								</div>
								<div className="absolute left-1/2 -top-2 transform -translate-x-1/2 opacity-30">
									<div className="w-2.5 h-2.5 bg-baby-purple/40 rounded-full animate-pulse"></div>
								</div>
								<div className="inline-flex items-center gap-3 mb-3">
									<Shirt className="h-5 w-5 text-baby-purple" />
									<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Dress Code
									</h3>
								</div>
								<p className="text-xl md:text-2xl font-serif text-gray-800">
									Any shade of blue
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Photo Upload Section */}
				<div className="mt-12 mb-8">
					<GuestPhotoUpload 
						eventId="baby-jasmine-binyag"
						storageBucket="baby_jasmine_binyag"
					/>
				</div>

				{/* Photo Gallery Section */}
				<div className="mb-8">
					<GuestPhotoGallery 
						eventId="baby-jasmine-binyag"
						storageBucket="baby_jasmine_binyag"
						eventName="Baby Jasmine"
					/>
				</div>

				{/* Footer Message */}
				<div className="text-center mt-12">
					<p className="text-gray-600 italic font-serif text-lg">
						We look forward to celebrating this special day with you!
					</p>
				</div>
			</div>
		</div>
		</GuestPhotoAuthProvider>
	);
};

export default BabyJasmineBinyag;

