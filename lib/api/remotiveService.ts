/**
 * Remotive API Service
 * 
 * Handles all communication with the Remotive API.
 * Includes caching, error handling, and data transformation.
 */

import { 
  RemotiveApiResponse, 
  RemotiveJob, 
  Job, 
  JobCategory,
  JobFilters,
  PaginatedResponse,
  SearchParams 
} from './types';
import { 
  cache, 
  cacheKeys, 
  cacheTTL 
} from './cache';
import { 
  ExternalApiError, 
  ValidationError,
  ERROR_MESSAGES 
} from './errorHandler';

// Remotive API Configuration
const REMOTIVE_CONFIG = {
  baseUrl: 'https://remotive.com/api',
  // Use environment variable if available, otherwise use default
  get jobsEndpoint() {
    return process.env.REMOTIVE_API_URL || `${this.baseUrl}/remote-jobs`;
  },
  timeout: 10000, // 10 seconds
  retries: 2,
};

// Job type mappings for standardization
const JOB_TYPE_MAP: Record<string, string> = {
  'full_time': 'Full Time',
  'part_time': 'Part Time',
  'contract': 'Contract',
  'freelance': 'Freelance',
  'internship': 'Internship',
  'temporary': 'Temporary',
};

// Reverse mapping
const JOB_TYPE_REVERSE_MAP: Record<string, string> = Object.entries(JOB_TYPE_MAP).reduce(
  (acc, [key, value]) => ({ ...acc, [value.toLowerCase()]: key }),
  {}
);

/**
 * Fetch jobs from Remotive API with caching
 */
export async function fetchJobsFromRemotive(
  filters?: JobFilters
): Promise<PaginatedResponse<Job>> {
  const { page = 1, limit = 20, category } = filters || {};
  
  // Generate cache key
  const cacheKey = cacheKeys.jobsList(page, limit, category);
  
  // Check cache first
  const cached = cache.get<PaginatedResponse<Job>>(cacheKey);
  if (cached) {
    return {
      ...cached.data,
      pagination: {
        ...cached.data.pagination,
        // Note: Can't modify fromCache in cached response directly
      },
    };
  }

  try {
    // Build URL with category filter
    let url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`; // Fetch max to cache
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
    
    if (!response.ok) {
      throw new ExternalApiError(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveApiResponse = await response.json();
    
    // Transform and process jobs
    const allJobs = data.jobs.map(job => processJob(job));
    
    // Apply pagination
    const total = allJobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);
    
    const result: PaginatedResponse<Job> = {
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    // Cache the result
    cache.set(cacheKey, result, cacheTTL.jobsList);
    
    return result;
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  }
}

/**
 * Fetch single job by ID
 */
export async function fetchJobById(id: number): Promise<Job> {
  const cacheKey = cacheKeys.jobDetail(id);
  
  // Check cache
  const cached = cache.get<Job>(cacheKey);
  if (cached) {
    return cached.data;
  }

  try {
    // Fetch all jobs and find by ID (Remotive doesn't have single job endpoint)
    const url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`;
    const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
    
    if (!response.ok) {
      throw new ExternalApiError(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveApiResponse = await response.json();
    
    const job = data.jobs.find(j => j.id === id);
    
    if (!job) {
      throw new ValidationError(`Job with ID ${id} not found`);
    }

    const processedJob = processJob(job);
    
    // Cache result
    cache.set(cacheKey, processedJob, cacheTTL.jobDetail);
    
    return processedJob;
  } catch (error) {
    if (error instanceof ExternalApiError || error instanceof ValidationError) {
      throw error;
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  }
}

/**
 * Search jobs by keyword, location, and job type
 */
export async function searchJobs(params: SearchParams): Promise<PaginatedResponse<Job>> {
  const { 
    keyword = '', 
    location = '', 
    jobType = '', 
    category = '',
    page = 1, 
    limit = 20 
  } = params;

  // Generate cache key
  const cacheKey = cacheKeys.search(keyword, location, jobType, category);
  
  // Check cache
  const cached = cache.get<PaginatedResponse<Job>>(cacheKey);
  if (cached) {
    return cached.data;
  }

  try {
    // Fetch all jobs (Remotive doesn't have advanced search)
    const url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`;
    const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
    
    if (!response.ok) {
      throw new ExternalApiError(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveApiResponse = await response.json();
    
    // Filter jobs based on search criteria
    let filteredJobs = data.jobs.map(job => processJob(job));
    
    // Apply keyword filter
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(keywordLower) ||
        job.description.toLowerCase().includes(keywordLower) ||
        job.company_name.toLowerCase().includes(keywordLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(keywordLower))
      );
    }
    
    // Apply location filter
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.candidate_required_location.toLowerCase().includes(locationLower) ||
        job.location?.toLowerCase().includes(locationLower)
      );
    }
    
    // Apply job type filter
    if (jobType) {
      const normalizedType = JOB_TYPE_REVERSE_MAP[jobType.toLowerCase()] || jobType;
      filteredJobs = filteredJobs.filter(job => 
        job.job_type.toLowerCase() === normalizedType.toLowerCase() ||
        job.jobTypeSlug.toLowerCase() === normalizedType.toLowerCase()
      );
    }
    
    // Apply category filter
    if (category) {
      filteredJobs = filteredJobs.filter(job => 
        job.category.toLowerCase() === category.toLowerCase() ||
        job.categorySlug.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply pagination
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);
    
    const result: PaginatedResponse<Job> = {
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    // Cache result
    cache.set(cacheKey, result, cacheTTL.search);
    
    return result;
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  }
}

/**
 * Get job categories
 */
export async function getJobCategories(): Promise<JobCategory[]> {
  const cacheKey = cacheKeys.categories();
  
  // Check cache
  const cached = cache.get<JobCategory[]>(cacheKey);
  if (cached) {
    return cached.data;
  }

  try {
    // Fetch all jobs to extract categories
    const url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`;
    const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
    
    if (!response.ok) {
      throw new ExternalApiError(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveApiResponse = await response.json();
    
    // Extract and count categories
    const categoryMap = new Map<string, number>();
    
    for (const job of data.jobs) {
      const category = job.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
    
    // Convert to array and sort by count
    const categories: JobCategory[] = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Cache result
    cache.set(cacheKey, categories, cacheTTL.categories);
    
    return categories;
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  }
}

/**
 * Get trending/recently posted jobs
 */
export async function getTrendingJobs(limit: number = 10): Promise<Job[]> {
  const cacheKey = cacheKeys.trending();
  
  // Check cache
  const cached = cache.get<Job[]>(cacheKey);
  if (cached) {
    return cached.data.slice(0, limit);
  }

  try {
    const url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`;
    const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
    
    if (!response.ok) {
      throw new ExternalApiError(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveApiResponse = await response.json();
    
    // Process and sort by publication date (most recent first)
    const jobs = data.jobs
      .map(job => processJob(job))
      .sort((a, b) => a.daysAgo - b.daysAgo) // Lower daysAgo = more recent
      .map((job, index) => ({
        ...job,
        isTrending: index < 10, // Mark first 10 as trending
      }));

    // Cache result
    cache.set(cacheKey, jobs, cacheTTL.jobsList);
    
    return jobs.slice(0, limit);
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  }
}

/**
 * Process and enrich a job from Remotive API
 */
function processJob(job: RemotiveJob): Job {
  const daysAgo = calculateDaysAgo(job.publication_date);
  const categorySlug = (job.category || '').toLowerCase().replace(/\s+/g, '-');
  const jobTypeSlug = (job.job_type || '').toLowerCase().replace(/\s+/g, '_');
  
  // Extract application deadline if available in description
  const applicationDeadline = extractDeadline(job.description, job.publication_date);
  
  // Extract location from candidate_required_location
  const location = job.candidate_required_location || 'Remote';
  
  return {
    ...job,
    applicationDeadline,
    daysAgo,
    isTrending: daysAgo <= 3, // Jobs posted within 3 days are considered trending
    categorySlug,
    companyLogo: job.company_logo || undefined,
    location,
    jobTypeSlug: JOB_TYPE_MAP[jobTypeSlug] || job.job_type,
  };
}

/**
 * Calculate days since publication
 */
function calculateDaysAgo(publicationDate: string): number {
  try {
    const pubDate = new Date(publicationDate);
    const now = new Date();
    const diffTime = now.getTime() - pubDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Extract application deadline from job description
 */
function extractDeadline(description: string, publicationDate: string): string | undefined {
  // Look for common deadline patterns
  const deadlinePatterns = [
    /deadline[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /apply by[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /closing date[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(\d{1,2}\s+\w+\s+\d{4})/i,
  ];

  for (const pattern of deadlinePatterns) {
    const match = description.match(pattern);
    if (match) {
      try {
        const deadline = new Date(match[1]);
        if (!isNaN(deadline.getTime())) {
          return deadline.toISOString().split('T')[0];
        }
      } catch {
        // Continue to next pattern
      }
    }
  }

  // If no deadline found, calculate based on common practice (30 days from posting)
  const pubDate = new Date(publicationDate);
  if (!isNaN(pubDate.getTime())) {
    const deadline = new Date(pubDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return deadline.toISOString().split('T')[0];
  }

  return undefined;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get job types list
 */
export function getJobTypes(): string[] {
  return Object.values(JOB_TYPE_MAP);
}

/**
 * Get all unique locations
 */
export async function getUniqueLocations(): Promise<string[]> {
  const url = `${REMOTIVE_CONFIG.jobsEndpoint}?limit=100`;
  const response = await fetchWithTimeout(url, REMOTIVE_CONFIG.timeout);
  
  if (!response.ok) {
    throw new ExternalApiError(`Remotive API error: ${response.status}`);
  }

  const data: RemotiveApiResponse = await response.json();
  
  const locations = new Set<string>();
  for (const job of data.jobs) {
    if (job.candidate_required_location) {
      // Split by comma and clean up
      const parts = job.candidate_required_location.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed && trimmed !== 'Worldwide' && trimmed !== 'Remote') {
          locations.add(trimmed);
        }
      }
    }
  }
  
  return Array.from(locations).sort();
}

export default {
  fetchJobsFromRemotive,
  fetchJobById,
  searchJobs,
  getJobCategories,
  getTrendingJobs,
  getJobTypes,
  getUniqueLocations,
};
