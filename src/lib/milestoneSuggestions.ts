/**
 * Basic milestone suggestions for each month (1-12)
 * These are age-appropriate developmental milestones that parents can quickly add
 */
export const BASIC_MILESTONE_SUGGESTIONS: Record<number, string[]> = {
	1: [
		"First smile",
		"Lifts head briefly when on tummy",
		"Follows objects with eyes",
		"Responds to sounds",
		"Makes eye contact",
	],
	2: [
		"Social smile",
		"Coos and gurgles",
		"Holds head up for short periods",
		"Tracks moving objects",
		"Recognizes familiar faces",
	],
	3: [
		"Rolls from tummy to back",
		"Grasps and shakes toys",
		"Laughs out loud",
		"Raises head and chest when on tummy",
		"Follows objects in a circle",
	],
	4: [
		"Rolls from back to tummy",
		"Reaches for objects",
		"Brings hands to mouth",
		"Pushes up on arms when on tummy",
		"Babbling begins",
	],
	5: [
		"Sits with support",
		"Transfers objects between hands",
		"Responds to name",
		"Shows interest in food",
		"Rolls both ways",
	],
	6: [
		"Sits without support",
		"Passes objects between hands",
		"Responds to emotions",
		"Begins to crawl",
		"First tooth appears",
	],
	7: [
		"Crawls forward",
		"Stands with support",
		"Uses pincer grasp",
		"Understands 'no'",
		"Stranger anxiety begins",
	],
	8: [
		"Pulls to standing",
		"Cruises along furniture",
		"Points at objects",
		"Plays peek-a-boo",
		"Eats finger foods",
	],
	9: [
		"Stands alone briefly",
		"Waves goodbye",
		"Claps hands",
		"Says 'mama' or 'dada'",
		"Follows simple commands",
	],
	10: [
		"Takes first steps",
		"Stacks blocks",
		"Points to body parts",
		"Uses gestures to communicate",
		"Drinks from a cup",
	],
	11: [
		"Walks independently",
		"Says a few words",
		"Climbs stairs with help",
		"Throws a ball",
		"Shows preferences",
	],
	12: [
		"Walks confidently",
		"Says 2-3 words clearly",
		"Follows one-step instructions",
		"Points to pictures in books",
		"First birthday!",
	],
};

/**
 * Get milestone suggestions for a specific month
 */
export function getMilestoneSuggestions(monthNumber: number): string[] {
	return BASIC_MILESTONE_SUGGESTIONS[monthNumber] || [];
}

/**
 * Filter out suggestions that already exist in the milestones list
 */
export function getAvailableSuggestions(
	monthNumber: number,
	existingMilestones: Array<{ milestone_text: string }>,
): string[] {
	const suggestions = getMilestoneSuggestions(monthNumber);
	const existingTexts = existingMilestones.map((m) =>
		m.milestone_text.toLowerCase().trim(),
	);

	return suggestions.filter(
		(suggestion) =>
			!existingTexts.includes(suggestion.toLowerCase().trim()),
	);
}

