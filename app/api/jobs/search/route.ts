/**
 * Job Search API Route
 * 
 * GET /api/jobs/search - Search jobs by keyword, location, job type, and category
 */

import { NextRequest } from 'next/server';
import { searchJobs } from '@/lib/api/remotiveService';
import { 
  handleCors, 
  createCorsResponse 
} from '@/lib/api/cors';
import { 
  checkRateLimit,
  createRateLimitHeaders,
  isRateLimitExceeded
} from '@/lib/api/rateLimiter';
import { 
  handleKnownError, 
  generateRequestId,
  logRequest,
  validatePagination,
  validateSearchQuery 
} from '@/lib/api/errorHandler';

// API Version
const API_VERSION = '1.0.0';

/**
 * GET /api/jobs/search
 * Search jobs with filters
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check rate limit (stricter for search)
    const rateLimitInfo = checkRateLimit(request, 'search');
    const rateLimitHeaders = createRateLimitHeaders(rateLimitInfo);
    
    if (isRateLimitExceeded(rateLimitInfo)) {
      const response = createCorsResponse(
        {
          success: false,
          error: {
            statusCode: 429,
            message: 'Too many search requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        429,
        request.headers.get('origin')
      );
      
      // Add rate limit headers
      for (const [key, value] of Object.entries(rateLimitHeaders)) {
        response.headers.set(key, value);
      }
      
      return response;
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate pagination
    const { page: validPage, limit: validLimit } = validatePagination(page, limit);
    
    // Validate search query if provided
    let validKeyword = undefined;
    if (keyword) {
      validKeyword = validateSearchQuery(keyword);
    }
    
    // Perform search
    const result = await searchJobs({
      keyword: validKeyword,
      location: location || undefined,
      jobType: jobType || undefined,
      category: category || undefined,
      page: validPage,
      limit: validLimit,
    });
    
    // Log request
    logRequest('GET', `/api/jobs/search?q=${validKeyword || ''}&loc=${location}&type=${jobType}`, 200, Date.now() - startTime, requestId);
    
    // Create response with CORS
    const response = createCorsResponse(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          version: API_VERSION,
          searchParams: {
            keyword: validKeyword,
            location: location || undefined,
            jobType: jobType || undefined,
            category: category || undefined,
          },
        },
      },
      200,
      request.headers.get('origin')
    );
    
    // Add rate limit headers
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
    
    return response;
    
  } catch (error) {
    // Log error
    logRequest('GET', '/api/jobs/search', 500, Date.now() - startTime, requestId);
    
    // Handle error
    const errorResponse = handleKnownError(error, requestId);
    
    // Add CORS headers to error response
    const corsErrorResponse = createCorsResponse(
      await errorResponse.json(),
      errorResponse.status,
      request.headers.get('origin')
    );
    
    return corsErrorResponse;
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
