/**
 * CORS Configuration
 * 
 * Configures CORS for Vercel serverless deployment,
 * allowing requests from Vercel frontend and development environments.
 */

import { NextRequest } from 'next/server';

// Allowed origins configuration
const ALLOWED_ORIGINS: RegExp[] = [
  // Vercel deployments
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/vercel\.app$/,
  // Development environments
  /^http:\/\/localhost:3000$/,
  /^http:\/\/localhost:3001$/,
  /^http:\/\/127\.0\.0\.1:3000$/,
  /^http:\/\/127\.0\.0\.1:3001$/,
];

// Add custom Vercel frontend domain from env if present
if (process.env.VERCEL_FRONTEND_URL) {
  try {
    // Convert URL to regex pattern
    const url = new URL(process.env.VERCEL_FRONTEND_URL);
    const escaped = url.origin.replace(/[.]/g, '\\.');
    const pattern = new RegExp(`^${escaped}$`);
    ALLOWED_ORIGINS.push(pattern);
  } catch {
    // Invalid URL, ignore
  }
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // No origin header (same-origin request)
  
  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed.test(origin)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get CORS headers for response
 */
export function getCorsHeaders(origin: string | null | undefined, requestMethod?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Request-ID',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  } else if (!origin) {
    // Same-origin request
    headers['Access-Control-Allow-Origin'] = '*';
  }

  // Add PREFLEIGHT_CACHE headers
  headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-ID';

  return headers;
}

/**
 * Handle CORS for request
 */
export async function handleCors(request: NextRequest): Promise<Response | null> {
  const origin = request.headers.get('origin');
  const requestMethod = request.headers.get('access-control-request-method');

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    const headers = getCorsHeaders(origin || undefined, requestMethod || undefined);
    
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  return null;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(response: Response, origin: string | null): Response {
  const headers = getCorsHeaders(origin);
  const newHeaders = new Headers(response.headers);
  
  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Create response with CORS headers
 */
export function createCorsResponse(
  body: unknown,
  status: number = 200,
  origin: string | null
): Response {
  const headers = getCorsHeaders(origin);
  headers['Content-Type'] = 'application/json';
  
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

/**
 * Middleware function to check CORS
 */
export function corsMiddleware(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  
  // Allow same-origin requests
  if (!origin) {
    return true;
  }
  
  return isOriginAllowed(origin);
}
