import type { Baby } from "@/hooks/useBabyProfiles";

/** Which baby-related modal (if any) is active on Home. Mutually exclusive. */
export enum HomeBabyModalKind {
	None = "none",
	AddBaby = "add-baby",
	EditBaby = "edit-baby",
}

export type HomeBabyModal =
	| { kind: HomeBabyModalKind.None }
	| { kind: HomeBabyModalKind.AddBaby }
	| { kind: HomeBabyModalKind.EditBaby; baby: Baby };

export const HOME_BABY_MODAL_CLOSED: HomeBabyModal = {
	kind: HomeBabyModalKind.None,
};
