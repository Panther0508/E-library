/**
 * HuggingFace AI API Route
 * 
 * POST /api/huggingface - AI-powered text operations
 */

import { NextRequest } from 'next/server';
import { 
  generateText, 
  summarizeText, 
  translateText, 
  analyzeSentiment, 
  getEmbeddings, 
  classifyZeroShot,
  getAvailableModels,
  isConfigured 
} from '@/lib/api/huggingfaceService';
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
 * POST /api/huggingface
 * AI-powered text operations
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    // Check rate limit (stricter for AI operations)
    const rateLimitInfo = checkRateLimit(request, 'search');
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
    
    // Check if HuggingFace is configured
    if (!isConfigured()) {
      throw new ValidationError('HuggingFace API is not configured. Please set HUGGINGFACE_API_TOKEN environment variable.');
    }
    
    // Parse request body
    const body = await request.json();
    const { action, ...params } = body;
    
    if (!action) {
      throw new ValidationError('Action is required. Valid actions: generate, summarize, translate, sentiment, embeddings, classify');
    }
    
    let result: unknown;
    
    // Route to appropriate handler based on action
    switch (action) {
      case 'generate':
        result = await generateText(params);
        break;
        
      case 'summarize':
        result = await summarizeText(params);
        break;
        
      case 'translate':
        result = await translateText(params);
        break;
        
      case 'sentiment':
        result = await analyzeSentiment(params);
        break;
        
      case 'embeddings':
        result = await getEmbeddings(params);
        break;
        
      case 'classify':
        result = await classifyZeroShot(params);
        break;
        
      default:
        throw new ValidationError(`Invalid action: ${action}. Valid actions: generate, summarize, translate, sentiment, embeddings, classify`);
    }
    
    // Log request
    logRequest('POST', `/api/huggingface?action=${action}`, 200, Date.now() - startTime, requestId);
    
    // Create response with CORS
    const response = createCorsResponse(
      {
        success: true,
        data: result,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          version: API_VERSION,
          action,
        },
      },
      200,
      request.headers.get('origin')
    );
    
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
    
    return response;
    
  } catch (error) {
    logRequest('POST', '/api/huggingface', 500, Date.now() - startTime, requestId);
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
 * GET /api/huggingface
 * Get available models and configuration
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  const corsPreflight = await handleCors(request);
  if (corsPreflight) return corsPreflight;
  
  try {
    const models = getAvailableModels();
    const configured = isConfigured();
    
    const response = createCorsResponse(
      {
        success: true,
        data: {
          configured,
          models,
          endpoints: {
            generate: {
              action: 'generate',
              description: 'Generate text from a prompt',
              params: {
                inputs: 'string (required)',
                model: 'string (optional)',
                parameters: {
                  max_new_tokens: 'number (optional, default: 100)',
                  temperature: 'number (optional, default: 0.7)',
                  top_p: 'number (optional, default: 0.9)',
                  top_k: 'number (optional, default: 50)',
                },
              },
              example: {
                action: 'generate',
                inputs: 'Once upon a time in a distant land',
                parameters: { max_new_tokens: 50 },
              },
            },
            summarize: {
              action: 'summarize',
              description: 'Summarize long text',
              params: {
                inputs: 'string (required)',
                model: 'string (optional)',
                parameters: {
                  max_length: 'number (optional, default: 200)',
                  min_length: 'number (optional, default: 30)',
                },
              },
            },
            translate: {
              action: 'translate',
              description: 'Translate text between languages',
              params: {
                inputs: 'string (required)',
                model: 'string (optional)',
              },
            },
            sentiment: {
              action: 'sentiment',
              description: 'Analyze text sentiment',
              params: {
                inputs: 'string (required)',
                model: 'string (optional)',
              },
            },
            embeddings: {
              action: 'embeddings',
              description: 'Get text embeddings for similarity search',
              params: {
                inputs: 'string (required)',
                model: 'string (optional)',
              },
            },
            classify: {
              action: 'classify',
              description: 'Zero-shot classification',
              params: {
                inputs: 'string (required)',
                parameters: {
                  candidate_labels: 'string[] (required)',
                  multi_label: 'boolean (optional)',
                },
              },
            },
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
