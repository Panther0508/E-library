/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting to prevent API abuse.
 * Uses in-memory storage for serverless Vercel deployment.
 */

import { NextRequest } from 'next/server';
import { RateLimitInfo } from './types';

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Window size in milliseconds (1 minute)
  WINDOW_MS: 60 * 1000,
  // Maximum requests per window
  MAX_REQUESTS: 30,
  // Maximum requests for search endpoints
  SEARCH_MAX_REQUESTS: 10,
  // Maximum requests for detailed endpoints
  DETAIL_MAX_REQUESTS: 60,
};

// In-memory rate limit storage
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.requests = new Map();
    
    // Periodic cleanup of expired entries
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), RATE_LIMIT_CONFIG.WINDOW_MS);
    }
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string, maxRequests: number = RATE_LIMIT_CONFIG.MAX_REQUESTS): RateLimitInfo {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // New window
      const resetTime = now + RATE_LIMIT_CONFIG.WINDOW_MS;
      this.requests.set(identifier, { count: 1, resetTime });
      
      return {
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetTime,
        used: 1,
      };
    }

    // Increment count
    record.count++;
    this.requests.set(identifier, record);

    return {
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - record.count),
      reset: record.resetTime,
      used: record.count,
    };
  }

  /**
   * Clean up expired rate limit records
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.requests.delete(key);
    }
  }

  /**
   * Get current rate limit status for an identifier
   */
  getStatus(identifier: string): RateLimitInfo | null {
    const record = this.requests.get(identifier);
    if (!record) return null;

    const now = Date.now();
    if (now > record.resetTime) return null;

    return {
      limit: RATE_LIMIT_CONFIG.MAX_REQUESTS,
      remaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS - record.count),
      reset: record.resetTime,
      used: record.count,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      activeIdentifiers: this.requests.size,
      windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
      maxRequests: RATE_LIMIT_CONFIG.MAX_REQUESTS,
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for Vercel deployment)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  // Use first available IP or fallback to a default
  const ip = forwarded?.split(',')[0]?.trim() 
    || realIP 
    || cfConnectingIP 
    || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check rate limit for request
 */
export function checkRateLimit(
  request: NextRequest,
  endpoint: string = 'default'
): RateLimitInfo {
  const identifier = getClientIdentifier(request);
  
  // Apply different limits based on endpoint
  let maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS;
  
  if (endpoint === 'search') {
    maxRequests = RATE_LIMIT_CONFIG.SEARCH_MAX_REQUESTS;
  } else if (endpoint === 'detail') {
    maxRequests = RATE_LIMIT_CONFIG.DETAIL_MAX_REQUESTS;
  }

  return rateLimiter.check(identifier, maxRequests);
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': new Date(info.reset).toISOString(),
  };
}

/**
 * Check if rate limit is exceeded
 */
export function isRateLimitExceeded(info: RateLimitInfo): boolean {
  return info.remaining <= 0;
}

export default rateLimiter;
