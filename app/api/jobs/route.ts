/**
 * Jobs API Route
 * 
 * GET /api/jobs - Fetch all jobs with pagination and filtering
 */

import { NextRequest } from 'next/server';
import { fetchJobsFromRemotive } from '@/lib/api/remotiveService';
import { 
  handleCors, 
  createCorsResponse,
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
  validatePagination 
} from '@/lib/api/errorHandler';

// API Version
const API_VERSION = '1.0.0';

/**
 * GET /api/jobs
 * Fetch all jobs with pagination and optional category filter
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check rate limit
    const rateLimitInfo = checkRateLimit(request, 'default');
    const rateLimitHeaders = createRateLimitHeaders(rateLimitInfo);
    
    if (isRateLimitExceeded(rateLimitInfo)) {
      const response = createCorsResponse(
        {
          success: false,
          error: {
            statusCode: 429,
            message: 'Too many requests. Please try again later.',
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category') || undefined;
    
    // Validate pagination
    const { page: validPage, limit: validLimit } = validatePagination(page, limit);
    
    // Fetch jobs from service
    const result = await fetchJobsFromRemotive({
      page: validPage,
      limit: validLimit,
      category,
    });
    
    // Log request
    logRequest('GET', `/api/jobs?page=${validPage}&limit=${validLimit}&category=${category || 'all'}`, 200, Date.now() - startTime, requestId);
    
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
    logRequest('GET', '/api/jobs', 500, Date.now() - startTime, requestId);
    
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

// Disable caching for dynamic routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;
