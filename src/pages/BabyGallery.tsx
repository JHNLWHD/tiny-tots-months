import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useBabyPhotos } from "@/hooks/useBabyPhotos";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { 
	ArrowLeft, 
	Calendar, 
	Camera, 
	Filter, 
	Grid3X3, 
	List, 
	Play, 
	Image as ImageIcon
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

const BabyGallery = () => {
	const { babyId } = useParams<{ babyId: string }>();
	const { babies } = useBabyProfiles();
	const { photos = [], isLoading } = useBabyPhotos(babyId || "");
	
	const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
	const [filterMonth, setFilterMonth] = useState<string>('all');
	const [filterType, setFilterType] = useState<string>('all');

	// Find the current baby
	const baby = babies.find(b => b.id === babyId);

	// Filter and sort photos
	const filteredPhotos = useMemo(() => {
		let filtered = photos;

		// Filter by month
		if (filterMonth !== 'all') {
			const monthNum = parseInt(filterMonth);
			filtered = filtered.filter(photo => photo.month_number === monthNum);
		}

		// Filter by type
		if (filterType === 'photos') {
			filtered = filtered.filter(photo => !photo.is_video);
		} else if (filterType === 'videos') {
			filtered = filtered.filter(photo => photo.is_video);
		}

		// Sort by creation date (newest first)
		return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}, [photos, filterMonth, filterType]);

	// Group photos by month for timeline view
	const photosByMonth = useMemo(() => {
		const grouped: { [key: number]: typeof photos } = {};
		filteredPhotos.forEach(photo => {
			const month = photo.month_number || 0;
			if (!grouped[month]) {
				grouped[month] = [];
			}
			grouped[month].push(photo);
		});
		return grouped;
	}, [filteredPhotos]);

	const getMonthName = (monthNum: number) => {
		if (monthNum === 0) return "Unassigned";
		const months = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		return `Month ${monthNum}`;
	};

	if (isLoading) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!baby) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-center">
				<h1 className="text-2xl font-heading text-gray-800 mb-4">Baby not found</h1>
				<Link to="/app" className="text-baby-purple hover:underline">
					← Back to App
				</Link>
			</div>
		);
	}

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link
					to="/app"
					className="p-2 hover:bg-gray-100 rounded-full transition-colors"
				>
					<ArrowLeft className="h-5 w-5 text-gray-600" />
				</Link>
				<div>
					<h1 className="text-3xl font-heading text-baby-purple">
						{baby.name}'s Gallery
					</h1>
					<p className="text-gray-600">
						{filteredPhotos.length} {filteredPhotos.length === 1 ? 'item' : 'items'} • Born {new Date(baby.date_of_birth).toLocaleDateString()}
					</p>
				</div>
			</div>

			{/* Filters and View Controls */}
			<Card className="p-4 border-baby-purple/20">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-600" />
							<span className="text-sm font-medium text-gray-700">Filters:</span>
						</div>
						
						<Select value={filterMonth} onValueChange={setFilterMonth}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Month" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Months</SelectItem>
								{Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
									<SelectItem key={month} value={month.toString()}>
										Month {month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Media</SelectItem>
								<SelectItem value="photos">Photos Only</SelectItem>
								<SelectItem value="videos">Videos Only</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant={viewMode === 'grid' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setViewMode('grid')}
							className={viewMode === 'grid' ? 'bg-baby-purple hover:bg-baby-purple/90' : ''}
						>
							<Grid3X3 className="h-4 w-4 mr-2" />
							Grid
						</Button>
						<Button
							variant={viewMode === 'timeline' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setViewMode('timeline')}
							className={viewMode === 'timeline' ? 'bg-baby-purple hover:bg-baby-purple/90' : ''}
						>
							<List className="h-4 w-4 mr-2" />
							Timeline
						</Button>
					</div>
				</div>
			</Card>

			{/* Content */}
			{filteredPhotos.length === 0 ? (
				<Card className="p-12 text-center border-baby-purple/20">
					<div className="w-16 h-16 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Camera className="h-8 w-8 text-baby-purple" />
					</div>
					<h3 className="font-heading text-xl text-gray-700 mb-2">No media found</h3>
					<p className="text-gray-500 mb-6">
						{filterMonth !== 'all' || filterType !== 'all' 
							? "Try adjusting your filters to see more content."
							: `Start uploading photos and videos for ${baby.name}!`
						}
					</p>
					<Link to={`/app/month/${babyId}/1`}>
						<Button className="bg-baby-purple hover:bg-baby-purple/90">
							<Camera className="h-4 w-4 mr-2" />
							Add Photos
						</Button>
					</Link>
				</Card>
			) : viewMode === 'grid' ? (
				// Grid View
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{filteredPhotos.map((photo) => (
						<Card
							key={photo.id}
							className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-baby-purple/30"
						>
							<div className="relative aspect-square bg-gray-100">
								{photo.is_video ? (
									<div className="relative w-full h-full">
										<video
											src={photo.url}
											className="w-full h-full object-cover"
											preload="metadata"
										/>
										<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
											<Play className="h-8 w-8 text-white" />
										</div>
										<div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
											<Play className="h-3 w-3 text-white" />
										</div>
									</div>
								) : (
									<div className="relative w-full h-full">
										<img
											src={photo.url}
											alt={photo.description || `Photo from month ${photo.month_number}`}
											className="w-full h-full object-cover"
										/>
										<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<ImageIcon className="h-8 w-8 text-white" />
										</div>
									</div>
								)}
								
								{/* Month badge */}
								{photo.month_number && (
									<div className="absolute top-2 left-2 bg-baby-purple/90 text-white text-xs px-2 py-1 rounded-full">
										Month {photo.month_number}
									</div>
								)}
							</div>
							
							{/* Caption and metadata - always show for consistent layout */}
							<div className="p-3 bg-white">
								<div className="min-h-[2.5rem] mb-2 flex items-start">
									{photo.description ? (
										<p className="text-sm text-gray-800 font-medium line-clamp-2">
											{photo.description}
										</p>
									) : (
										<p className="text-sm text-gray-400 italic">
											No description
										</p>
									)}
								</div>
								<div className="flex items-center justify-between text-xs text-gray-500">
									<span>
										{new Date(photo.created_at).toLocaleDateString()}
									</span>
									{photo.is_video && (
										<span className="flex items-center gap-1">
											<Play className="h-3 w-3" />
											Video
										</span>
									)}
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				// Timeline View
				<div className="space-y-8">
					{Object.entries(photosByMonth)
						.sort(([a], [b]) => parseInt(b) - parseInt(a))
						.map(([month, monthPhotos]) => (
							<Card key={month} className="p-6 border-baby-purple/20">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-baby-purple/20 rounded-full flex items-center justify-center">
										<Calendar className="h-5 w-5 text-baby-purple" />
									</div>
									<div>
										<h3 className="font-heading text-xl text-baby-purple">
											{getMonthName(parseInt(month))}
										</h3>
										<p className="text-gray-500 text-sm">
											{monthPhotos.length} {monthPhotos.length === 1 ? 'item' : 'items'}
										</p>
									</div>
								</div>
								
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{monthPhotos.map((photo) => (
										<Card
											key={photo.id}
											className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-baby-purple/30"
										>
											<div className="relative aspect-square bg-gray-100">
												{photo.is_video ? (
													<div className="relative w-full h-full">
														<video
															src={photo.url}
															className="w-full h-full object-cover"
															preload="metadata"
														/>
														<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
															<Play className="h-6 w-6 text-white" />
														</div>
														<div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
															<Play className="h-3 w-3 text-white" />
														</div>
													</div>
												) : (
													<img
														src={photo.url}
														alt={photo.description || `Photo from month ${photo.month_number}`}
														className="w-full h-full object-cover"
													/>
												)}
											</div>
											
											{/* Caption and metadata - always show for consistent layout */}
											<div className="p-3 bg-white">
												<div className="min-h-[2.5rem] mb-2 flex items-start">
													{photo.description ? (
														<p className="text-sm text-gray-800 font-medium line-clamp-2">
															{photo.description}
														</p>
													) : (
														<p className="text-sm text-gray-400 italic">
															No description
														</p>
													)}
												</div>
												<div className="flex items-center justify-between text-xs text-gray-500">
													<span>
														{new Date(photo.created_at).toLocaleDateString()}
													</span>
													{photo.is_video && (
														<span className="flex items-center gap-1">
															<Play className="h-3 w-3" />
															Video
														</span>
													)}
												</div>
											</div>
										</Card>
									))}
								</div>
							</Card>
						))}
				</div>
			)}
		</div>
	);
};

export default BabyGallery;
