import { Camera, CheckCircle2, Share2 } from "lucide-react";
import React from "react";

const ProblemSolutionSection = () => {
	return (
		<section
			className="bg-white py-16"
			id="problem-solution"
			aria-labelledby="why-heading"
		>
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center mb-12">
					<h2 id="why-heading" className="text-3xl font-bold mb-4">
						Why Tiny Tots Milestones?
					</h2>
					<p className="text-gray-600">
						Parents often struggle with scattered photos, messy notes, and the
						challenge of sharing their baby's growth with loved ones. Tiny Tots
						Milestones brings it all together in one beautiful, easy-to-use app.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<article className="bg-baby-blue/10 p-8 rounded-xl text-center">
						<div className="bg-baby-blue/20 inline-flex p-3 rounded-full mb-4">
							<Camera className="h-6 w-6 text-baby-blue" aria-hidden="true" />
						</div>
						<h3 className="text-xl font-semibold mb-3">Organized Memories</h3>
						<p className="text-gray-600">
							Effortlessly organize your baby's photos and videos month by
							month, never lose a precious moment again.
						</p>
					</article>
					<article className="bg-baby-pink/10 p-8 rounded-xl text-center">
						<div className="bg-baby-pink/20 inline-flex p-3 rounded-full mb-4">
							<CheckCircle2
								className="h-6 w-6 text-baby-pink"
								aria-hidden="true"
							/>
						</div>
						<h3 className="text-xl font-semibold mb-3">Track Development</h3>
						<p className="text-gray-600">
							Record and celebrate developmental milestones with our guided
							suggestions for each age.
						</p>
					</article>
					<article className="bg-baby-mint/10 p-8 rounded-xl text-center">
						<div className="bg-baby-mint/20 inline-flex p-3 rounded-full mb-4">
							<Share2 className="h-6 w-6 text-baby-mint" aria-hidden="true" />
						</div>
						<h3 className="text-xl font-semibold mb-3">Private Sharing</h3>
						<p className="text-gray-600">
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
