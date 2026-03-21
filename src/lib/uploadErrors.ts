export type UploadErrorPhase =
	| "validation"
	| "auth"
	| "storage"
	| "database"
	| "processing";

export class UploadFailedError extends Error {
	readonly phase: UploadErrorPhase;
	readonly providerCode?: string;

	constructor(message: string, phase: UploadErrorPhase, providerCode?: string) {
		super(message);
		this.name = "UploadFailedError";
		this.phase = phase;
		this.providerCode = providerCode;
	}
}

export function providerCodeFromUnknown(err: unknown): string | undefined {
	if (!err || typeof err !== "object") return undefined;
	const o = err as Record<string, unknown>;
	if (typeof o.code === "string" && o.code.length > 0) return o.code;
	if (typeof o.statusCode === "number") return String(o.statusCode);
	if (typeof o.statusCode === "string") return o.statusCode;
	return undefined;
}
