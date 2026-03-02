/**
 * Rate Limiting Utility
 * 
 * Prevents brute force attacks and API abuse
 * Uses in-memory storage (for production, use Redis)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (replace with Redis in production)
const store: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 5, // 5 attempts per minute
};

/**
 * Check if request is rate limited
 * @param identifier - Unique identifier (IP, user ID, email)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = store[identifier];

  // No record or expired - create new
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: store[identifier].resetTime,
    };
  }

  // Within window - check count
  if (record.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: config.maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit middleware for server actions
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Error message if rate limited, null if allowed
 */
export function rateLimitAction(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): string | null {
  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    return `Too many attempts. Please try again in ${result.retryAfter} seconds.`;
  }

  return null;
}

/**
 * Clean up old records (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Predefined rate limit configs
 */
export const RATE_LIMITS = {
  // Login attempts: 5 per minute
  LOGIN: { windowMs: 60 * 1000, maxAttempts: 5 } as RateLimitConfig,
  
  // Signup: 3 per hour
  SIGNUP: { windowMs: 60 * 60 * 1000, maxAttempts: 3 } as RateLimitConfig,
  
  // Password reset: 3 per hour
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, maxAttempts: 3 } as RateLimitConfig,
  
  // API calls: 100 per minute
  API: { windowMs: 60 * 1000, maxAttempts: 100 } as RateLimitConfig,
  
  // Checkout: 10 per minute
  CHECKOUT: { windowMs: 60 * 1000, maxAttempts: 10 } as RateLimitConfig,
};
