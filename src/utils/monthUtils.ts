const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * Gets the month name based on the baby's birth date and month number.
 * month_number 1 = birth month, month_number 2 = birth month + 1, etc.
 * @param birthDate - The baby's date of birth
 * @param monthNumber - The month number (1-12)
 * @returns The month name (e.g., "January", "February")
 */
export const getMonthNameFromMonthNumber = (
	birthDate: string | Date,
	monthNumber: number,
): string => {
	const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
	const birthMonth = birth.getMonth(); // 0-11 (0 = January, 11 = December)

	// month_number 1 = birth month (index 0-11)
	// month_number 2 = birth month + 1, etc.
	// Wrap around if it exceeds 12 months
	const monthIndex = (birthMonth + monthNumber - 1) % 12;
	return monthNames[monthIndex] || "Unknown";
};

