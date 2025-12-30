import GuestPhotoGallery from "@/components/GuestPhotoGallery";
import GuestPhotoUpload, { type ColorTheme } from "@/components/GuestPhotoUpload";
import { GuestPhotoAuthProvider } from "@/context/GuestPhotoAuthContext";
import {
	Calendar,
	Clock,
	MapPin,
	Navigation,
} from "lucide-react";
import type React from "react";
import { Helmet } from "react-helmet-async";

// Gold and Maroon color theme
const weddingColorTheme: ColorTheme = {
	primary: "#D4AF37", // Gold
	primaryHover: "rgba(212, 175, 55, 0.9)",
	primaryLight: "rgba(212, 175, 55, 0.1)",
	primaryDark: "rgba(212, 175, 55, 0.3)",
	shadow: "rgba(128, 0, 0, 0.15)", // Maroon shadow
	border: "rgba(212, 175, 55, 0.3)",
	bg: "rgba(212, 175, 55, 0.05)",
};

const IbsAndHashWedding = () => {
	return (
		<GuestPhotoAuthProvider passcodeEnvVar="VITE_IBS_AND_HASH_WEDDING_PASSCODE" defaultPasscode="">
			<Helmet>
				<title>Ibs & Hash Wedding - December 21, 2025</title>
				<meta
					name="description"
					content="You're invited to the wedding of Hon Ismael Undug Sappayani and Hazra Asaali Ibrahim on December 21, 2025 at Astoria Regency Convention Center, Pasonanca, Zamboanga City. Join us for this special Islamic wedding celebration!"
				/>
				<meta
					name="keywords"
					content="Ibs, Hash, wedding, December 2025, Astoria Regency Convention Center, Zamboanga City, Islamic wedding, celebration, invitation"
				/>

				{/* Open Graph tags for social sharing */}
				<meta
					property="og:title"
					content="Ibs & Hash Wedding - December 21, 2025"
				/>
				<meta
					property="og:description"
					content="You're invited to the wedding of Hon Ismael Undug Sappayani and Hazra Asaali Ibrahim on December 21, 2025 at Astoria Regency Convention Center, Pasonanca, Zamboanga City."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={window.location.href} />
				<meta
					property="og:image"
					content={`${window.location.origin}/ibs-and-hash-wedding/couple.jpeg`}
				/>
				<meta property="og:image:alt" content="Ibs & Hash Wedding" />

				{/* Twitter Card data */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="Ibs & Hash Wedding - December 21, 2025"
				/>
				<meta
					property="twitter:title"
					content="Ibs & Hash Wedding - December 21, 2025"
				/>
				<meta
					name="twitter:description"
					content="You're invited to the wedding of Hon Ismael Undug Sappayani and Hazra Asaali Ibrahim on December 21, 2025 at Astoria Regency Convention Center, Pasonanca, Zamboanga City."
				/>
				<meta
					property="twitter:description"
					content="You're invited to the wedding of Hon Ismael Undug Sappayani and Hazra Asaali Ibrahim on December 21, 2025 at Astoria Regency Convention Center, Pasonanca, Zamboanga City."
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
					content={`${window.location.origin}/ibs-and-hash-wedding/couple.jpeg`}
				/>
				<meta
					property="twitter:image"
					content={`${window.location.origin}/ibs-and-hash-wedding/couple.jpeg`}
				/>
				<meta name="twitter:image:alt" content="Ibs & Hash Wedding" />
				<meta property="twitter:image:alt" content="Ibs & Hash Wedding" />

				{/* Canonical URL */}
				<link rel="canonical" href={window.location.href} />
			</Helmet>

			<div className="min-h-screen relative overflow-hidden" style={{
				background: 'linear-gradient(135deg, #fefefe 0%, #f9f7f5 50%, #f5f3f0 100%)',
			}}>
				{/* Decorative Background Elements */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					{/* Gold accent splashes */}
					<div className="absolute top-0 left-0 w-64 h-64 opacity-20" style={{
						background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
						transform: 'translate(-30%, -30%)',
					}}></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 opacity-15" style={{
						background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
						transform: 'translate(-20%, 20%)',
					}}></div>
					<div className="absolute bottom-0 right-0 w-80 h-80 opacity-20" style={{
						background: 'radial-gradient(circle, rgba(128, 0, 0, 0.2) 0%, transparent 70%)',
						transform: 'translate(20%, 20%)',
					}}></div>
					{/* Marble texture overlay */}
					<div className="absolute inset-0 opacity-[0.03]" style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
					}}></div>

					{/* Decorative Islamic geometric patterns */}
					<div className="absolute top-4 left-2 md:top-10 md:left-10 opacity-30 md:opacity-20" style={{ transform: 'rotate(-15deg)' }}>
						<svg width="50" height="50" viewBox="0 0 60 60" className="md:w-[60px] md:h-[60px]">
							<path d="M30 10 L40 30 L20 30 Z" fill="#D4AF37" opacity="0.6"/>
							<path d="M30 50 L40 30 L20 30 Z" fill="#D4AF37" opacity="0.6"/>
							<circle cx="30" cy="30" r="8" fill="#800000" opacity="0.4"/>
						</svg>
					</div>
					<div className="absolute top-8 right-2 md:top-20 md:right-20 opacity-25 md:opacity-15" style={{ transform: 'rotate(20deg)' }}>
						<svg width="45" height="45" viewBox="0 0 50 50" className="md:w-[50px] md:h-[50px]">
							<path d="M25 5 L35 25 L15 25 Z" fill="#800000" opacity="0.5"/>
							<path d="M25 45 L35 25 L15 25 Z" fill="#800000" opacity="0.5"/>
							<circle cx="25" cy="25" r="6" fill="#D4AF37" opacity="0.4"/>
						</svg>
					</div>
					<div className="absolute bottom-16 left-2 md:bottom-20 md:left-20 opacity-30 md:opacity-20" style={{ transform: 'rotate(10deg)' }}>
						<svg width="48" height="48" viewBox="0 0 55 55" className="md:w-[55px] md:h-[55px]">
							<path d="M27 7 L37 27 L17 27 Z" fill="#D4AF37" opacity="0.5"/>
							<path d="M27 48 L37 27 L17 27 Z" fill="#D4AF37" opacity="0.5"/>
							<circle cx="27" cy="27" r="7" fill="#800000" opacity="0.3"/>
						</svg>
					</div>
					<div className="absolute bottom-4 right-2 md:bottom-10 md:right-10 opacity-25 md:opacity-15" style={{ transform: 'rotate(-20deg)' }}>
						<svg width="40" height="40" viewBox="0 0 45 45" className="md:w-[45px] md:h-[45px]">
							<path d="M22 4 L32 24 L12 24 Z" fill="#800000" opacity="0.4"/>
							<path d="M22 41 L32 24 L12 24 Z" fill="#800000" opacity="0.4"/>
							<circle cx="22" cy="24" r="5" fill="#D4AF37" opacity="0.3"/>
						</svg>
					</div>
				</div>

				<div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative z-10">
					{/* Elegant Invitation Card */}
					<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
						boxShadow: `0 20px 60px ${weddingColorTheme.shadow}, 0 0 0 1px rgba(128, 0, 0, 0.05)`,
					}}>
						{/* Decorative corner patterns */}
						<div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-30 md:opacity-20">
							<svg viewBox="0 0 100 100" className="w-full h-full">
								<path d="M50 10 L70 50 L30 50 Z" fill="#D4AF37" opacity="0.5"/>
								<path d="M50 90 L70 50 L30 50 Z" fill="#D4AF37" opacity="0.5"/>
								<circle cx="50" cy="50" r="12" fill="#800000" opacity="0.4"/>
							</svg>
						</div>
						<div className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 opacity-30 md:opacity-20">
							<svg viewBox="0 0 100 100" className="w-full h-full">
								<path d="M50 14 L72 50 L28 50 Z" fill="#800000" opacity="0.4"/>
								<path d="M50 86 L72 50 L28 50 Z" fill="#800000" opacity="0.4"/>
								<circle cx="50" cy="50" r="14" fill="#D4AF37" opacity="0.35"/>
							</svg>
						</div>

						<div className="p-8 md:p-16 relative">
							{/* Header Section */}
							<div className="text-center mb-12 relative">
								{/* Decorative patterns around header */}
								<div className="absolute -left-4 top-4 md:-left-8 md:top-8 opacity-40 md:opacity-30 animate-float" style={{ animationDuration: '5s' }}>
									<svg width="20" height="20" viewBox="0 0 25 25" className="md:w-[25px] md:h-[25px]">
										<circle cx="12" cy="12" r="5" fill="#D4AF37" opacity="0.5"/>
										<circle cx="7" cy="7" r="3" fill="#800000" opacity="0.4"/>
										<circle cx="17" cy="7" r="3" fill="#800000" opacity="0.4"/>
										<circle cx="7" cy="17" r="3" fill="#800000" opacity="0.4"/>
										<circle cx="17" cy="17" r="3" fill="#800000" opacity="0.4"/>
									</svg>
								</div>
								<div className="absolute -right-4 top-6 md:-right-8 md:top-12 opacity-40 md:opacity-30 animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}>
									<svg width="18" height="18" viewBox="0 0 22 22" className="md:w-[22px] md:h-[22px]">
										<circle cx="11" cy="11" r="4" fill="#800000" opacity="0.5"/>
										<circle cx="6" cy="6" r="2.5" fill="#D4AF37" opacity="0.4"/>
										<circle cx="16" cy="6" r="2.5" fill="#D4AF37" opacity="0.4"/>
										<circle cx="6" cy="16" r="2.5" fill="#D4AF37" opacity="0.4"/>
										<circle cx="16" cy="16" r="2.5" fill="#D4AF37" opacity="0.4"/>
									</svg>
								</div>

								{/* Couple Image */}
								<div className="mb-8 flex justify-center">
									<div className="relative mx-auto">
										{/* Sparkles around image */}
										<div className="absolute -top-4 -left-4 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.4)' }}></div>
										<div className="absolute -top-2 -right-6 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.5)', animationDelay: '0.5s' }}></div>
										<div className="absolute -bottom-4 -left-2 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(128, 0, 0, 0.4)', animationDelay: '1s' }}></div>
										<div className="absolute -bottom-2 -right-4 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(128, 0, 0, 0.5)', animationDelay: '1.5s' }}></div>
										<div className="absolute inset-0 rounded-lg blur-2xl" style={{
											background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(128, 0, 0, 0.1) 100%)',
										}}></div>
										<img
											src="/ibs-and-hash-wedding/couple.jpeg"
											alt="Ibs & Hash"
											className="relative w-64 h-auto md:w-96 md:h-auto object-contain rounded-lg drop-shadow-2xl animate-fade-in border-4 mx-auto"
											style={{ borderColor: '#D4AF37' }}
										/>
									</div>
								</div>
								<p className="text-lg md:text-xl mb-4 font-serif italic tracking-wide" style={{ color: 'rgba(128, 0, 0, 0.9)' }}>
									Ibs and Hash
								</p>
								<h1 className="text-4xl md:text-5xl font-bold mb-6 font-heading tracking-tight relative" style={{
									color: '#D4AF37',
									textShadow: '0 2px 10px rgba(212, 175, 55, 0.2)',
								}}>
									Wedding
								</h1>
								<div className="flex items-center justify-center gap-4 mb-6">
									<div className="w-16 h-px" style={{
										background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.4))',
									}}></div>
									<div className="relative">
										<div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.4)' }}></div>
										<div className="absolute inset-0 flex items-center justify-center">
											<svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60">
												<circle cx="4" cy="4" r="1.5" fill="#D4AF37"/>
												<circle cx="2" cy="2" r="1" fill="#800000" opacity="0.7"/>
												<circle cx="6" cy="2" r="1" fill="#800000" opacity="0.7"/>
												<circle cx="2" cy="6" r="1" fill="#800000" opacity="0.7"/>
												<circle cx="6" cy="6" r="1" fill="#800000" opacity="0.7"/>
											</svg>
										</div>
									</div>
									<div className="w-16 h-px" style={{
										background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.4))',
									}}></div>
								</div>
							</div>

							{/* Main Content */}
							<div className="space-y-10 relative">
								{/* Decorative elements scattered throughout content */}
								<div className="absolute left-0 top-8 opacity-30 animate-float" style={{ animationDuration: '7s' }}>
									<svg width="18" height="18" viewBox="0 0 22 22" className="md:w-[22px] md:h-[22px]">
										<circle cx="11" cy="11" r="4" fill="#800000" opacity="0.4"/>
										<circle cx="6" cy="6" r="2.5" fill="#D4AF37" opacity="0.3"/>
										<circle cx="16" cy="6" r="2.5" fill="#D4AF37" opacity="0.3"/>
										<circle cx="6" cy="16" r="2.5" fill="#D4AF37" opacity="0.3"/>
										<circle cx="16" cy="16" r="2.5" fill="#D4AF37" opacity="0.3"/>
									</svg>
								</div>

								{/* Date & Time */}
								<div className="text-center relative">
									<div className="inline-flex items-center gap-3 mb-3">
										<Calendar className="h-5 w-5" style={{ color: '#D4AF37' }} />
										<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
											Date & Time
										</h3>
									</div>
									<p className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">
										December 21, 2025
									</p>
									<div className="flex items-center justify-center gap-2 text-gray-600">
										<Clock className="h-4 w-4" style={{ color: '#D4AF37' }} />
										<p className="text-lg">2:00 PM</p>
									</div>
								</div>

								<div className="flex items-center justify-center gap-4 my-8 relative">
									<div className="w-24 h-px" style={{
										background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.2))',
									}}></div>
									<div className="relative">
										<div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.3)' }}></div>
										<svg width="8" height="8" viewBox="0 0 8 8" className="absolute -top-1 -left-1 opacity-50">
											<circle cx="4" cy="4" r="1.5" fill="#D4AF37"/>
											<circle cx="2" cy="2" r="1" fill="#800000" opacity="0.7"/>
											<circle cx="6" cy="2" r="1" fill="#800000" opacity="0.7"/>
											<circle cx="2" cy="6" r="1" fill="#800000" opacity="0.7"/>
											<circle cx="6" cy="6" r="1" fill="#800000" opacity="0.7"/>
										</svg>
									</div>
									<div className="w-24 h-px" style={{
										background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.2))',
									}}></div>
								</div>

								{/* Venue */}
								<div className="text-center relative">
									<div className="inline-flex items-center gap-3 mb-3">
										<MapPin className="h-5 w-5" style={{ color: '#D4AF37' }} />
										<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
											Venue
										</h3>
									</div>
									<p className="text-xl md:text-2xl font-serif text-gray-800 mb-4 leading-relaxed">
										ASTORIA REGENCY CONVENTION CENTER<br />
										<span className="text-lg text-gray-600">PASONANCA, ZAMBOANGA CITY</span>
									</p>
									<a
										href="https://maps.app.goo.gl/eTHBBiLFBEcvTJfBA"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 font-medium transition-colors text-sm"
										style={{ color: '#D4AF37' }}
										onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(212, 175, 55, 0.8)'}
										onMouseLeave={(e) => e.currentTarget.style.color = '#D4AF37'}
									>
										<Navigation className="h-4 w-4" />
										<span>Get Directions</span>
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Photo Upload Section */}
					<div className="mt-12 mb-8">
						<GuestPhotoUpload 
							eventId="ibs-and-hash-wedding"
							storageBucket="ibs_and_hash_wedding"
							colorTheme={weddingColorTheme}
						/>
					</div>

					{/* Photo Gallery Section */}
					<div className="mb-8">
						<GuestPhotoGallery 
							eventId="ibs-and-hash-wedding"
							storageBucket="ibs_and_hash_wedding"
							eventName="Ibs & Hash Wedding"
							colorTheme={weddingColorTheme}
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

export default IbsAndHashWedding;

