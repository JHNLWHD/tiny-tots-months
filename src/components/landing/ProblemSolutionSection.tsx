import { Camera, CheckCircle2, Share2 } from "lucide-react";
import React from "react";

const ProblemSolutionSection = () => {
	return (
		<section
			className="bg-gradient-to-b from-white to-gray-50 py-20"
			id="problem-solution"
			aria-labelledby="why-heading"
		>
			<div className="w-full px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto text-center mb-16">
					<h2 id="why-heading" className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
						Why <span className="text-baby-purple">Tiny Tots Milestones</span>?
					</h2>
					<p className="text-xl text-gray-600 leading-relaxed">
						Parents often struggle with scattered photos, messy notes, and the
						challenge of sharing their baby's growth with loved ones. Tiny Tots
						Milestones brings it all together in one beautiful, easy-to-use app.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
					<article className="royal-blue-card-gradient p-10 rounded-2xl text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-baby-purple/10">
						<div className="bg-baby-purple/10 inline-flex p-4 rounded-full mb-6 shadow-md">
							<Camera className="h-8 w-8 text-baby-purple" aria-hidden="true" />
						</div>
						<h3 className="text-2xl font-bold mb-4 text-gray-800">Organized Memories</h3>
						<p className="text-gray-600 leading-relaxed">
							Effortlessly organize your baby's photos and videos month by
							month, never lose a precious moment again.
						</p>
					</article>
					<article className="royal-blue-card-gradient p-10 rounded-2xl text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-baby-purple/10">
						<div className="bg-baby-purple/10 inline-flex p-4 rounded-full mb-6 shadow-md">
							<CheckCircle2
								className="h-8 w-8 text-baby-purple"
								aria-hidden="true"
							/>
						</div>
						<h3 className="text-2xl font-bold mb-4 text-gray-800">Track Development</h3>
						<p className="text-gray-600 leading-relaxed">
							Record and celebrate developmental milestones with our guided
							suggestions for each age.
						</p>
					</article>
					<article className="royal-blue-card-gradient p-10 rounded-2xl text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-baby-purple/10">
						<div className="bg-baby-purple/10 inline-flex p-4 rounded-full mb-6 shadow-md">
							<Share2 className="h-8 w-8 text-baby-purple" aria-hidden="true" />
						</div>
						<h3 className="text-2xl font-bold mb-4 text-gray-800">Private Sharing</h3>
						<p className="text-gray-600 leading-relaxed">
							Securely share your baby's journey with family and friends using
							unique private links.
						</p>
					</article>
				</div>
			</div>
		</section>
	);
};

export default ProblemSolutionSection;
