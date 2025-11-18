/**
 * Application-wide constants
 * Centralized configuration values for maintainability
 */

// Cache TTLs (Time To Live in milliseconds)
export const CACHE_TTL = {
  CMS: 5 * 60 * 1000,              // 5 minutes
  COMPLIANCE: 12 * 60 * 60 * 1000, // 12 hours
  MARKET: 60 * 60 * 1000,          // 1 hour
  VEHICLE: 60 * 60 * 1000,         // 1 hour
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 10 * 60 * 1000,     // 10 minutes
    MAX_ATTEMPTS: 10,
  },
  LEADS: {
    WINDOW_MS: 60 * 60 * 1000,     // 1 hour
    MAX_ATTEMPTS: 10,
  },
  API: {
    WINDOW_MS: 60 * 1000,          // 1 minute
    MAX_ATTEMPTS: 60,
  },
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024,      // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ] as const,
  MAX_IMAGE_WIDTH: 2000,           // pixels
  WEBP_QUALITY: 82,                // 0-100
} as const;

// Vehicle and market data
export const VEHICLE_CONSTRAINTS = {
  MIN_YEAR: 1980,
  MAX_YEAR: new Date().getFullYear() + 1,
  MIN_MILEAGE: 0,
} as const;

// Damage scoring
export const DAMAGE_SCORING = {
  MIN_SCORE: 1,
  MAX_SCORE: 5,
} as const;

// HTTP status codes (for clarity)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
