import BabySelector from "@/components/BabySelector";
import Layout from "@/components/Layout";
import MilestoneSection from "@/components/month/MilestoneSection";
import MonthHeader from "@/components/month/MonthHeader";
import PhotoSection from "@/components/month/PhotoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthPage } from "@/hooks/useMonthPage";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

const Month = () => {
	const { monthId, babyId } = useParams<{ monthId: string; babyId: string }>();
	const monthNumber = Number.parseInt(monthId || "1", 10);

	const {
		babies,
		selectedBabyId,
		selectedBaby,
		activeTab,
		photos,
		milestones,
		isLoading,
		loadingBabies,
		isUploading,
		isCreatingMilestone,
		handleBabySelect,
		handleTabChange,
		uploadPhoto,
		deletePhoto,
		createMilestone,
		deleteMilestone,
		refetchPhotos,
		loadingPhotos,
		loadingMilestones,
	} = useMonthPage(monthNumber, babyId);

	return (
		<Layout hideHeader>
			<div className="max-w-4xl mx-auto">
				<div className="mb-4 sm:mb-8">
					<MonthHeader monthNumber={monthNumber} selectedBaby={selectedBaby} />

					{isLoading ? (
						<div className="flex justify-center py-6 sm:py-8">
							<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-500" />
						</div>
					) : (
						<>
							<div className="mb-4 sm:mb-6">
								<BabySelector
									babies={babies}
									selectedBabyId={selectedBabyId}
									onSelectBaby={handleBabySelect}
									isLoading={loadingBabies}
								/>
							</div>

							{selectedBabyId ? (
								<Tabs
									defaultValue="photos"
									value={activeTab}
									onValueChange={handleTabChange}
								>
									<TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
										<TabsTrigger value="photos">Photos</TabsTrigger>
										<TabsTrigger value="milestones">Milestones</TabsTrigger>
									</TabsList>

									<TabsContent value="photos">
										<PhotoSection
											babyId={selectedBabyId}
											monthNumber={monthNumber}
											photos={photos}
											isUploading={isUploading}
											uploadPhoto={uploadPhoto}
											deletePhoto={deletePhoto}
											refetchPhotos={refetchPhotos}
											isLoading={loadingPhotos}
										/>
									</TabsContent>

									<TabsContent value="milestones">
										<MilestoneSection
											babyId={selectedBabyId}
											monthNumber={monthNumber}
											milestones={milestones}
											isLoading={loadingMilestones}
											createMilestone={createMilestone}
											deleteMilestone={deleteMilestone}
											isCreatingMilestone={isCreatingMilestone}
										/>
									</TabsContent>
								</Tabs>
							) : (
								<div className="text-center py-6 sm:py-8">
									<p className="text-gray-500">
										Add a baby to start tracking milestones
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default Month;
