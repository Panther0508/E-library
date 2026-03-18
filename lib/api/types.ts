/**
 * Type definitions for the Remotive Job API
 * 
 * This module contains all TypeScript interfaces and types
 * used throughout the job API service.
 */

// Remotive API Response Types
export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string | null;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export interface RemotiveApiResponse {
  job_count: number;
  jobs: RemotiveJob[];
}

// Extended Job Type with additional processing
export interface Job extends RemotiveJob {
  // Calculated fields
  applicationDeadline?: string;
  daysAgo: number;
  isTrending: boolean;
  categorySlug: string;
  companyLogo?: string;
  location?: string;
  jobTypeSlug: string;
}

// Category Type
export interface JobCategory {
  name: string;
  slug: string;
  count: number;
  icon?: string;
}

// Job Filter Options
export interface JobFilters {
  category?: string;
  jobType?: string;
  location?: string;
  keyword?: string;
  limit?: number;
  page?: number;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Search Parameters
export interface SearchParams {
  keyword?: string;
  location?: string;
  jobType?: string;
  category?: string;
  limit?: number;
  page?: number;
}

// API Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// Rate Limiter Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CachedResponse<T> {
  data: T;
  fromCache: boolean;
  cacheAge?: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

// Job Statistics
export interface JobStats {
  totalJobs: number;
  categoriesCount: number;
  jobTypesCount: number;
  locationsCount: number;
  recentlyPosted: number;
  trendingCount: number;
}

// Trending Job Response
export interface TrendingJobsResponse {
  jobs: Job[];
  stats: {
    totalTrending: number;
    period: string;
  };
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    cache: 'up' | 'down';
    externalApi: 'up' | 'down';
  };
  uptime: number;
}
