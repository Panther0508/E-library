/**
 * Trending Jobs API Route
 * 
 * GET /api/jobs/trending - Get recently posted (trending) jobs
 */

import { NextRequest } from 'next/server';
import { getTrendingJobs } from '@/lib/api/remotiveService';
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
  logRequest 
} from '@/lib/api/errorHandler';

// API Version
const API_VERSION = '1.0.0';

/**
 * GET /api/jobs/trending
 * Get trending/recently posted jobs
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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    
    // Fetch trending jobs
    const jobs = await getTrendingJobs(limit);
    
    // Log request
    logRequest('GET', `/api/jobs/trending?limit=${limit}`, 200, Date.now() - startTime, requestId);
    
    // Create response with CORS
    const response = createCorsResponse(
      {
        success: true,
        data: {
          jobs,
          stats: {
            totalTrending: jobs.length,
            period: '7 days',
          },
        },
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
    logRequest('GET', '/api/jobs/trending', 500, Date.now() - startTime, requestId);
    
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
export const revalidate = 180; // Cache for 3 minutes
