/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
const PATTERNS = {
  // Allow alphanumeric, spaces, basic punctuation for recipe categories
  RECIPE_CATEGORY: /^[a-zA-Z0-9\s\-'&()]+$/,
  // Allow alphanumeric, spaces, and common punctuation for business context
  BUSINESS_CONTEXT: /^[a-zA-Z0-9\s\-\.,;:'"&()!?]+$/,
  // Allow numbers, commas, dots for currency
  CURRENCY: /^[0-9.,\s]+$/,
  // Basic XSS prevention - no script tags, angle brackets
  NO_HTML: /^[^<>\"']*$/,
  // Length limits
  MAX_CATEGORY_LENGTH: 100,
  MAX_CONTEXT_LENGTH: 2000,
  MAX_CURRENCY_LENGTH: 20
};

/**
 * Sanitize text input to prevent XSS and prompt injection
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove potential script injection patterns
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/['"`]/g, '') // Remove quotes that could be used for injection
    .trim();

  return sanitized;
}

/**
 * Validate recipe category input
 */
export function validateRecipeCategory(category: string): string {
  const sanitized = sanitizeInput(category);

  if (sanitized.length === 0) {
    throw new Error('Kategori resep tidak boleh kosong');
  }

  if (sanitized.length > PATTERNS.MAX_CATEGORY_LENGTH) {
    throw new Error(`Kategori resep terlalu panjang (maksimal ${PATTERNS.MAX_CATEGORY_LENGTH} karakter)`);
  }

  if (!PATTERNS.RECIPE_CATEGORY.test(sanitized)) {
    throw new Error('Kategori resep hanya boleh berisi huruf, angka, spasi, dan tanda baca dasar');
  }

  return sanitized;
}

/**
 * Validate business context for marketing strategy
 */
export function validateBusinessContext(context: string): string {
  const sanitized = sanitizeInput(context);

  if (sanitized.length === 0) {
    throw new Error('Konteks bisnis tidak boleh kosong');
  }

  if (sanitized.length > PATTERNS.MAX_CONTEXT_LENGTH) {
    throw new Error(`Konteks bisnis terlalu panjang (maksimal ${PATTERNS.MAX_CONTEXT_LENGTH} karakter)`);
  }

  if (!PATTERNS.BUSINESS_CONTEXT.test(sanitized)) {
    throw new Error('Konteks bisnis mengandung karakter yang tidak diizinkan');
  }

  return sanitized;
}

/**
 * Validate currency input for HPP calculation
 */
export function validateCurrencyInput(input: string): string {
  const sanitized = sanitizeInput(input);

  if (sanitized.length > PATTERNS.MAX_CURRENCY_LENGTH) {
    throw new Error(`Input harga terlalu panjang (maksimal ${PATTERNS.MAX_CURRENCY_LENGTH} karakter)`);
  }

  // Allow empty for optional fields
  if (sanitized.length === 0) {
    return sanitized;
  }

  if (!PATTERNS.CURRENCY.test(sanitized)) {
    throw new Error('Format harga tidak valid (hanya angka, titik, dan koma)');
  }

  return sanitized;
}

/**
 * Rate limiting utility
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed based on rate limits
   * @param identifier - User/session identifier
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * Clean up old entries periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < 3600000); // 1 hour
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);
