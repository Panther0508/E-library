/**
 * API Library Index
 * 
 * Central export point for all API utilities and services.
 * Provides a clean interface for importing API functionality.
 */

// Types
export * from './types';

// Core utilities
export { default as cache, cacheKeys, cacheTTL } from './cache';
export { default as rateLimiter, checkRateLimit, createRateLimitHeaders, isRateLimitExceeded, getClientIdentifier } from './rateLimiter';
export * from './errorHandler';
export * from './cors';

// Services
export { 
  fetchJobsFromRemotive,
  fetchJobById,
  searchJobs,
  getJobCategories,
  getTrendingJobs,
  getJobTypes,
  getUniqueLocations,
  default as remoteJobService 
} from './remotiveService';

// HuggingFace AI Services
export {
  generateText,
  summarizeText,
  translateText,
  analyzeSentiment,
  getEmbeddings,
  classifyZeroShot,
  getAvailableModels,
  isConfigured,
  default as huggingFaceService
} from './huggingfaceService';

// Documentation
export { 
  API_INFO, 
  ENDPOINTS, 
  ERROR_RESPONSES, 
  JOB_TYPES, 
  RATE_LIMIT_INFO, 
  CACHE_INFO, 
  SAMPLE_RESPONSES,
  getOpenAPISpec 
} from './docs';

// Re-export for convenience
import { cache } from './cache';
import { rateLimiter } from './rateLimiter';

export const apiServices = {
  cache,
  rateLimiter,
};

export default {
  cache,
  rateLimiter,
  apiServices,
};
