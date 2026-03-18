/**
 * Single Job Detail API Route
 * 
 * GET /api/jobs/[id] - Get detailed information for a specific job
 */

import { NextRequest } from 'next/server';
import { fetchJobById } from '@/lib/api/remotiveService';
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
  ValidationError
} from '@/lib/api/errorHandler';

// API Version
const API_VERSION = '1.0.0';

/**
 * GET /api/jobs/[id]
 * Get single job by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check rate limit
    const rateLimitInfo = checkRateLimit(request, 'detail');
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
    
    // Get job ID from params
    const resolvedParams = await params;
    const jobId = parseInt(resolvedParams.id, 10);
    
    // Validate job ID
    if (isNaN(jobId) || jobId <= 0) {
      throw new ValidationError('Invalid job ID. Must be a positive number.');
    }
    
    // Fetch job details
    const job = await fetchJobById(jobId);
    
    // Log request
    logRequest('GET', `/api/jobs/${jobId}`, 200, Date.now() - startTime, requestId);
    
    // Create response with CORS
    const response = createCorsResponse(
      {
        success: true,
        data: job,
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
    logRequest('GET', `/api/jobs/${(await params).id}`, 500, Date.now() - startTime, requestId);
    
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
export const revalidate = 600; // Cache for 10 minutes
