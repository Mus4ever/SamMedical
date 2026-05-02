/**
 * Algerian phone number utilities.
 *
 * Canonical format: +213XXXXXXXXX  (12 digits incl. country code)
 *
 * Algerian mobile numbers start with 5, 6, or 7 after the country code,
 * so a valid full number looks like +2135XXXXXXXX, +2136XXXXXXXX, +2137XXXXXXXX.
 * Landlines start with 2, 3, or 4.
 *
 * We accept loose input (the doctor might type "0770000000" or "+213 770 00 00 00")
 * and normalize to the canonical form.
 */

/**
 * Normalize a phone number to canonical +213XXXXXXXXX form.
 * Returns the normalized string, or '' if input is empty.
 *
 * Examples:
 *   "0770000000"      → "+213770000000"
 *   "770000000"       → "+213770000000"
 *   "+213 770 00 00"  → "+21377000000"
 *   "00213770000000"  → "+213770000000"
 */
const normalizePhone = (raw) => {
  if (!raw) return '';
  const cleaned = String(raw).replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+213'))   return cleaned;
  if (cleaned.startsWith('00213'))  return '+' + cleaned.slice(2);
  if (cleaned.startsWith('213'))    return '+' + cleaned;
  if (cleaned.startsWith('0'))      return '+213' + cleaned.slice(1);
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
};

/**
 * Validate that a normalized phone number is a plausible Algerian number.
 * Returns true if it matches +213 followed by 9 digits.
 *
 * Note: we don't enforce the leading 5/6/7 because the doctor may also
 * register patients with landline numbers if they don't have a mobile.
 */
const isValidAlgerianPhone = (normalized) => {
  return /^\+213\d{9}$/.test(normalized);
};

module.exports = { normalizePhone, isValidAlgerianPhone };
