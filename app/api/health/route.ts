/**
 * Health Check API Route
 * 
 * GET /api/health - Check API health status
 */

import { NextRequest } from 'next/server';
import { handleCors, createCorsResponse } from '@/lib/api/cors';
import { cache } from '@/lib/api/cache';
import { rateLimiter } from '@/lib/api/rateLimiter';
import { API_INFO } from '@/lib/api/docs';

// Track API start time
const API_START_TIME = Date.now();

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check cache status
    const cacheStats = cache.getStats();
    const cacheStatus = cacheStats.size < cacheStats.maxSize ? 'up' : 'degraded';
    
    // Check rate limiter status
    const rateLimitStats = rateLimiter.getStats();
    const rateLimitStatus = rateLimitStats.activeIdentifiers < 1000 ? 'up' : 'degraded';
    
    // Determine overall health
    const healthStatus = (cacheStatus === 'up' && rateLimitStatus === 'up') 
      ? 'healthy' 
      : 'degraded';
    
    const uptime = Date.now() - API_START_TIME;
    
    const response = createCorsResponse(
      {
        status: healthStatus,
        timestamp: new Date().toISOString(),
        version: API_INFO.version,
        services: {
          cache: cacheStatus,
          rateLimiter: rateLimitStatus,
        },
        stats: {
          cache: cacheStats,
          rateLimiter: rateLimitStats,
          uptime: {
            milliseconds: uptime,
            formatted: formatUptime(uptime),
          },
        },
      },
      healthStatus === 'healthy' ? 200 : 503,
      request.headers.get('origin')
    );
    
    return response;
    
  } catch (error) {
    // Return unhealthy status
    const response = createCorsResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: API_INFO.version,
        error: 'Health check failed',
      },
      503,
      request.headers.get('origin')
    );
    
    return response;
  }
}

/**
 * Format uptime milliseconds to human readable string
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Check every minute
