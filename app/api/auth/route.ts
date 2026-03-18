/**
 * Authentication API Route
 * 
 * Backup authentication system that works without Supabase.
 * POST /api/auth - Login or register
 * GET /api/auth - Verify session
 */

import { NextRequest } from 'next/server';
import { 
  registerUser, 
  loginUser, 
  verifySession, 
  logoutUser,
  getStats 
} from '@/lib/api/authService';
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
 * POST /api/auth
 * Login or register a user
 */
export async function POST(request: NextRequest) {
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
      
      for (const [key, value] of Object.entries(rateLimitHeaders)) {
        response.headers.set(key, value);
      }
      
      return response;
    }
    
    // Parse request body
    const body = await request.json();
    const { action, email, password, name } = body;
    
    if (!action) {
      throw new ValidationError('Action is required. Valid actions: login, register');
    }
    
    let result: unknown;
    
    switch (action) {
      case 'login':
        if (!email || !password) {
          throw new ValidationError('Email and password are required for login');
        }
        result = await loginUser(email, password);
        break;
        
      case 'register':
        if (!email || !password) {
          throw new ValidationError('Email and password are required for registration');
        }
        if (password.length < 6) {
          throw new ValidationError('Password must be at least 6 characters');
        }
        result = await registerUser(email, password, name || '');
        break;
        
      case 'logout':
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          logoutUser(token);
        }
        result = { success: true, message: 'Logged out successfully' };
        break;
        
      default:
        throw new ValidationError(`Invalid action: ${action}. Valid actions: login, register, logout`);
    }
    
    // Log request
    logRequest('POST', `/api/auth?action=${action}`, 200, Date.now() - startTime, requestId);
    
    // Create response with CORS
    const response = createCorsResponse(
      {
        success: true,
        data: result,
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
    
    // Set auth token in cookie if login/register successful
    if (result && typeof result === 'object' && 'token' in result) {
      const token = (result as { token: string }).token;
      response.headers.set('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
    }
    
    return response;
    
  } catch (error) {
    logRequest('POST', '/api/auth', 500, Date.now() - startTime, requestId);
    const errorResponse = handleKnownError(error, requestId);
    const corsErrorResponse = createCorsResponse(
      await errorResponse.json(),
      errorResponse.status,
      request.headers.get('origin')
    );
    return corsErrorResponse;
  }
}

/**
 * GET /api/auth
 * Verify session or get auth stats
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check for auth token in header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    let token: string | undefined;
    
    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
    } else if (cookieHeader) {
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
    
    // Verify token
    if (token) {
      const session = verifySession(token);
      
      if (session) {
        const response = createCorsResponse(
          {
            success: true,
            data: {
              authenticated: true,
              user: {
                id: session.userId,
                email: session.email,
                name: session.name,
                avatarColor: session.avatarColor,
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
        
        return response;
      }
    }
    
    // Not authenticated
    const response = createCorsResponse(
      {
        success: true,
        data: {
          authenticated: false,
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
    
    return response;
    
  } catch (error) {
    const errorResponse = handleKnownError(error, requestId);
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
