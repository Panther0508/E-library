/**
 * API Documentation Route
 * 
 * GET /api/docs - Get API documentation
 */

import { NextRequest } from 'next/server';
import { handleCors, createCorsResponse } from '@/lib/api/cors';
import { API_INFO, ENDPOINTS, ERROR_RESPONSES, RATE_LIMIT_INFO, CACHE_INFO, SAMPLE_RESPONSES } from '@/lib/api/docs';

/**
 * GET /api/docs
 * Get API documentation
 */
export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  const docs = {
    ...API_INFO,
    endpoints: ENDPOINTS,
    errorResponses: ERROR_RESPONSES,
    rateLimiting: RATE_LIMIT_INFO,
    caching: CACHE_INFO,
    samples: SAMPLE_RESPONSES,
    gettingStarted: {
      authentication: 'No authentication required for public endpoints',
      pagination: 'Use "page" and "limit" query parameters',
      filtering: 'Filter by category, jobType, location using query parameters',
      search: 'Use /api/jobs/search endpoint for keyword search',
      rateLimiting: 'See rateLimiting section for limits per endpoint',
    },
    SDK: {
      javascript: `
// Using fetch
const response = await fetch('/api/jobs?page=1&limit=20');
const data = await response.json();
console.log(data.data);
      `,
      typescript: `
import { Job, PaginatedResponse } from '@/lib/api/types';

const response = await fetch('/api/jobs?page=1&limit=20');
const result: { success: boolean; data: Job[]; pagination: any } = await response.json();
      `,
    },
  };
  
  const response = createCorsResponse(docs, 200, request.headers.get('origin'));
  
  return response;
}

export const dynamic = 'force-dynamic';
