/**
 * Application-wide constants
 */

// Cache TTLs (in milliseconds)
export const CMS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const COMPLIANCE_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Rate limiting defaults (in milliseconds)
export const ADMIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const LEAD_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
