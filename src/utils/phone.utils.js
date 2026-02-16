/**
 * Formats a phone number to include the +254 prefix.
 * Replaces leading '0' with '+254'.
 * Prepends '+' if starting with '254'.
 * Limits length to 13 characters.
 * @param {string} value - The input phone number string.
 * @returns {string} - The formatted phone number.
 */
export const formatPhoneNumber = (value) => {
    if (!value) return '';

    // Remove all non-numeric characters except leading +
    let cleaned = value.replace(/[^\d+]/g, '');

    // Handle leading zero: 0722000000 -> +254722000000
    if (cleaned.startsWith('0')) {
        cleaned = '+254' + cleaned.substring(1);
    }

    // Handle case where user types 254... (missing +)
    if (cleaned.startsWith('254')) {
        cleaned = '+' + cleaned;
    }

    // If user starts typing 7... (common mistake?), we could prepend +254, 
    // but better to only handle explicit 0 or 254 cases to avoid preventing other codes.

    // Enforce max length for standard Kenyan number (+254 + 9 digits = 13 chars)
    // But strictly speaking, we shouldn't block longer numbers if international... 
    // User asked for +254 specifically.
    if (cleaned.startsWith('+254') && cleaned.length > 13) {
        cleaned = cleaned.substring(0, 13);
    }

    return cleaned;
};
