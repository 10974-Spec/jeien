// User roles
export const USER_ROLES = {
  BUYER: 'BUYER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN'
}

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  ON_HOLD: 'ON_HOLD'
}

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
}

// Payment methods
export const PAYMENT_METHODS = {
  MPESA: 'MPESA',
  PAYPAL: 'PAYPAL',
  CARD: 'CARD',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
}

// Product types
export const PRODUCT_TYPES = {
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
  SERVICE: 'SERVICE'
}

// Ad positions
export const AD_POSITIONS = {
  HOME_TOP: 'HOME_TOP',
  HOME_MIDDLE: 'HOME_MIDDLE',
  HOME_BOTTOM: 'HOME_BOTTOM',
  CATEGORY_TOP: 'CATEGORY_TOP',
  PRODUCT_SIDEBAR: 'PRODUCT_SIDEBAR',
  CHECKOUT: 'CHECKOUT',
  SEARCH_RESULTS: 'SEARCH_RESULTS'
}

// Review statuses
export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  HIDDEN: 'HIDDEN'
}

// Commission rates
export const COMMISSION_RATES = {
  DEFAULT: 10,
  MIN: 0,
  MAX: 50
}

// Countries (African focus)
export const COUNTRIES = [
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'UG', name: 'Uganda', currency: 'UGX' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF' },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB' }
]

// Shipping cost defaults
export const SHIPPING_COSTS = {
  STANDARD: 500,
  EXPRESS: 1000,
  FREE_THRESHOLD: 5000
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10
}

// API response timeout
export const API_TIMEOUT = 30000

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  RECENT_SEARCHES: 'recent_searches',
  THEME: 'theme'
}

// Image upload limits
export const IMAGE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_COUNT: 10,
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
}

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9+\-\s()]{10,15}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
}