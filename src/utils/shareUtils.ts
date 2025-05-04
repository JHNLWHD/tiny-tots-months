
/**
 * Utility functions for sharing functionality
 */

/**
 * Generates a shareable URL based on a token and share type
 */
export const generateShareUrl = (token: string, type: 'baby' | 'month'): string => {
  const baseUrl = window.location.origin;
  const path = type === 'baby' ? `/shared/baby/${token}` : `/shared/month/${token}`;
  return `${baseUrl}${path}`;
};

/**
 * Generates a share title based on baby name and type
 */
export const getShareTitle = (babyName: string, type: 'baby' | 'month', monthNumber?: number): string => {
  if (type === 'baby') {
    return `Check out ${babyName}'s milestone journey!`;
  } else {
    return `Check out ${babyName}'s Month ${monthNumber} milestones!`;
  }
};

/**
 * Copy text to clipboard with error handling
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
