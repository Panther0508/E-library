/**
 * In-Memory Cache with TTL Support
 * 
 * Provides efficient caching for API responses to reduce
 * external API calls and improve response times.
 * Optimized for serverless Vercel deployment.
 */

import { CacheEntry, CachedResponse } from './types';

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL in milliseconds (5 minutes)
  DEFAULT_TTL: 5 * 60 * 1000,
  // Jobs list cache TTL (3 minutes)
  JOBS_LIST_TTL: 3 * 60 * 1000,
  // Single job cache TTL (10 minutes)
  JOB_DETAIL_TTL: 10 * 60 * 1000,
  // Categories cache TTL (15 minutes)
  CATEGORIES_TTL: 15 * 60 * 1000,
  // Search results cache TTL (2 minutes)
  SEARCH_TTL: 2 * 60 * 1000,
  // Max cache size (number of entries)
  MAX_SIZE: 100,
};

// In-memory cache storage
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private accessOrder: string[];
  private hits: number = 0;
  private misses: number = 0;

  constructor() {
    this.cache = new Map();
    this.accessOrder = [];
    
    // Periodic cleanup of expired entries
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Clean every minute
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): CachedResponse<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.misses++;
      return null;
    }

    // Update access order for LRU
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
    
    this.hits++;
    
    return {
      data: entry.data,
      fromCache: true,
      cacheAge: age,
    };
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    // Check if we need to evict (LRU)
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return result;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    }
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      maxSize: CACHE_CONFIG.MAX_SIZE,
    };
  }

  /**
   * Pre-warm cache with data
   */
  async warm<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return cached.data;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  jobsList: (page: number, limit: number, category?: string) => 
    `jobs:list:${page}:${limit}:${category || 'all'}`,
  
  jobDetail: (id: number) => `jobs:detail:${id}`,
  
  categories: () => 'jobs:categories',
  
  search: (keyword: string, location?: string, jobType?: string, category?: string) => 
    `jobs:search:${keyword}:${location || 'any'}:${jobType || 'any'}:${category || 'any'}`,
  
  trending: () => 'jobs:trending',
  
  stats: () => 'jobs:stats',
};

// TTL getters
export const cacheTTL = {
  default: CACHE_CONFIG.DEFAULT_TTL,
  jobsList: CACHE_CONFIG.JOBS_LIST_TTL,
  jobDetail: CACHE_CONFIG.JOB_DETAIL_TTL,
  categories: CACHE_CONFIG.CATEGORIES_TTL,
  search: CACHE_CONFIG.SEARCH_TTL,
};

export default cache;
