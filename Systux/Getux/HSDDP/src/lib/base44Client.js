/**
 * Compat shim kept for legacy imports from older Base44 exports.
 * This project runs fully local (no backend SDK).
 */

export const base44 = {
  isAvailable: false,
  reason: 'Base44 SDK removed for local-only mode',
};

export default base44;
