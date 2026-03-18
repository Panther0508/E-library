/**
 * API Documentation
 * 
 * Comprehensive documentation for the Job API endpoints.
 * This file serves as both documentation and OpenAPI-like specification.
 */

import { Job, JobCategory, PaginatedResponse, TrendingJobsResponse } from './types';

/**
 * API Version and Base Info
 */
export const API_INFO = {
  title: 'EngineerVault Job API',
  version: '1.0.0',
  description: 'Backend API for fetching remote job listings from Remotive API',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  docsUrl: '/api/docs',
};

/**
 * Endpoint Documentation
 */
export const ENDPOINTS = {
  // Jobs endpoints
  jobs: {
    GET: {
      path: '/api/jobs',
      summary: 'Fetch all jobs with pagination',
      description: 'Retrieves a paginated list of all available remote jobs',
      queryParams: {
        page: {
          type: 'number',
          required: false,
          default: 1,
          description: 'Page number for pagination',
          example: 1,
        },
        limit: {
          type: 'number',
          required: false,
          default: 20,
          description: 'Number of items per page (max 100)',
          example: 20,
        },
        category: {
          type: 'string',
          required: false,
          description: 'Filter by job category',
          example: 'software-development',
        },
      },
      response: {
        '200': {
          description: 'Successful response',
          schema: 'PaginatedResponse<Job>',
        },
      },
    },
  },

  // Search endpoint
  search: {
    GET: {
      path: '/api/jobs/search',
      summary: 'Search jobs',
      description: 'Search jobs by keyword, location, job type, and category',
      queryParams: {
        keyword: {
          type: 'string',
          required: false,
          description: 'Search keyword',
          example: 'react',
        },
        location: {
          type: 'string',
          required: false,
          description: 'Filter by location',
          example: 'USA',
        },
        jobType: {
          type: 'string',
          required: false,
          description: 'Filter by job type',
          example: 'full_time',
        },
        category: {
          type: 'string',
          required: false,
          description: 'Filter by category',
          example: 'software-development',
        },
        page: {
          type: 'number',
          required: false,
          default: 1,
          description: 'Page number',
        },
        limit: {
          type: 'number',
          required: false,
          default: 20,
          description: 'Items per page',
        },
      },
    },
  },

  // Categories endpoint
  categories: {
    GET: {
      path: '/api/jobs/categories',
      summary: 'Get job categories',
      description: 'Retrieves all available job categories with job counts',
      response: {
        '200': {
          description: 'Successful response',
          schema: 'JobCategory[]',
        },
      },
    },
  },

  // Single job endpoint
  jobDetail: {
    GET: {
      path: '/api/jobs/[id]',
      summary: 'Get single job details',
      description: 'Retrieves detailed information for a specific job by ID',
      params: {
        id: {
          type: 'number',
          required: true,
          description: 'Job ID',
          example: 12345,
        },
      },
    },
  },

  // Trending jobs endpoint
  trending: {
    GET: {
      path: '/api/jobs/trending',
      summary: 'Get trending jobs',
      description: 'Retrieves the most recently posted jobs (trending)',
      queryParams: {
        limit: {
          type: 'number',
          required: false,
          default: 10,
          description: 'Number of trending jobs to return',
          example: 10,
        },
      },
    },
  },

  // Health check endpoint
  health: {
    GET: {
      path: '/api/health',
      summary: 'Health check',
      description: 'Check API health status and service availability',
    },
  },
};

/**
 * Error Responses
 */
export const ERROR_RESPONSES = {
  '400': {
    description: 'Bad Request',
    examples: [
      { message: 'Invalid page number', code: 'VALIDATION_ERROR' },
      { message: 'Invalid limit value', code: 'VALIDATION_ERROR' },
      { message: 'Search query must be at least 2 characters', code: 'VALIDATION_ERROR' },
    ],
  },
  '404': {
    description: 'Not Found',
    examples: [
      { message: 'Job not found', code: 'NOT_FOUND' },
    ],
  },
  '429': {
    description: 'Too Many Requests',
    examples: [
      { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
    ],
  },
  '500': {
    description: 'Internal Server Error',
    examples: [
      { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { message: 'Unable to fetch data from external service', code: 'EXTERNAL_API_ERROR' },
    ],
  },
  '502': {
    description: 'Bad Gateway',
    examples: [
      { message: 'External API error', code: 'EXTERNAL_API_ERROR' },
    ],
  },
};

/**
 * Job Type Values
 */
export const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

/**
 * Rate Limiting Info
 */
export const RATE_LIMIT_INFO = {
  default: {
    limit: 30,
    window: '1 minute',
    description: 'General API endpoints',
  },
  search: {
    limit: 10,
    window: '1 minute',
    description: 'Search endpoint',
  },
  detail: {
    limit: 60,
    window: '1 minute',
    description: 'Single job detail endpoint',
  },
};

/**
 * Cache Information
 */
export const CACHE_INFO = {
  'jobs:list': { ttl: '3 minutes' },
  'jobs:detail': { ttl: '10 minutes' },
  'jobs:categories': { ttl: '15 minutes' },
  'jobs:search': { ttl: '2 minutes' },
  'jobs:trending': { ttl: '3 minutes' },
};

/**
 * Sample Responses for Documentation
 */
export const SAMPLE_RESPONSES = {
  jobsList: {
    success: true,
    data: [
      {
        id: 12345,
        url: 'https://remotive.com/remote-jobs/software-development/react-developer-12345',
        title: 'React Developer',
        company_name: 'Tech Corp',
        company_logo: 'https://example.com/logo.png',
        category: 'Software Development',
        tags: ['react', 'javascript', 'typescript'],
        job_type: 'Full Time',
        publication_date: '2024-01-15T10:00:00Z',
        candidate_required_location: 'Worldwide',
        salary: '$80,000 - $120,000',
        description: '<p>Job description...</p>',
        applicationDeadline: '2024-02-15',
        daysAgo: 2,
        isTrending: true,
        categorySlug: 'software-development',
        location: 'Remote',
        jobTypeSlug: 'Full Time',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1500,
      totalPages: 75,
      hasNext: true,
      hasPrevious: false,
    },
    meta: {
      timestamp: '2024-01-17T10:00:00Z',
      version: '1.0.0',
    },
  },
  categories: [
    { name: 'Software Development', slug: 'software-development', count: 500 },
    { name: 'Customer Service', slug: 'customer-service', count: 200 },
  ],
  trending: {
    jobs: [],
    stats: { totalTrending: 10, period: '7 days' },
  },
};

/**
 * Generate OpenAPI-like specification
 */
export function getOpenAPISpec() {
  return {
    openapi: '3.0.0',
    info: API_INFO,
    paths: {
      '/api/jobs': {
        get: ENDPOINTS.jobs.GET,
      },
      '/api/jobs/search': {
        get: ENDPOINTS.search.GET,
      },
      '/api/jobs/categories': {
        get: ENDPOINTS.categories.GET,
      },
      '/api/jobs/trending': {
        get: ENDPOINTS.trending.GET,
      },
      '/api/health': {
        get: ENDPOINTS.health.GET,
      },
    },
    components: {
      schemas: {
        Job: {},
        JobCategory: {},
        Error: {},
      },
    },
  };
}

export default {
  API_INFO,
  ENDPOINTS,
  ERROR_RESPONSES,
  JOB_TYPES,
  RATE_LIMIT_INFO,
  CACHE_INFO,
  SAMPLE_RESPONSES,
  getOpenAPISpec,
};
