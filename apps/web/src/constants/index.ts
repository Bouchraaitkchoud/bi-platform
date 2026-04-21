/**
 * Application Constants
 */

/**
 * API Configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Authentication
 */
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_KEY = 'current_user';

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Sort Order
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Form Validation
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
} as const;

/**
 * Date/Time Formats
 */
export const DATE_FORMAT = 'MM/DD/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'MM/DD/YYYY HH:mm';

/**
 * Debounce/Throttle Delays (in milliseconds)
 */
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 1000;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Toast Duration (in milliseconds)
 */
export const TOAST_DURATION = 3000;

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

/**
 * Request Status
 */
export const REQUEST_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * Color Palette
 */
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
} as const;

/**
 * Breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Z-Index Scale
 */
export const Z_INDEX = {
  DROPDOWN: 50,
  STICKY: 100,
  FIXED: 200,
  MODAL_BACKDROP: 1000,
  MODAL: 1001,
  TOAST: 2000,
  TOOLTIP: 3000,
} as const;
