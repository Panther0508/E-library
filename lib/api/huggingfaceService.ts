/**
 * HuggingFace API Service
 * 
 * Provides integration with HuggingFace Inference API
 * for various AI tasks including text generation, embeddings,
 * sentiment analysis, and more.
 */

import { cache, cacheKeys, cacheTTL } from './cache';
import { ExternalApiError, ValidationError, ERROR_MESSAGES } from './errorHandler';

// HuggingFace API Configuration
const HF_CONFIG = {
  baseUrl: 'https://api-inference.huggingface.co',
  get headers() {
    const token = process.env.HUGGINGFACE_API_TOKEN;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
  timeout: 30000, // 30 seconds
  maxRetries: 2,
};

// Type definitions for HuggingFace responses
export interface HuggingFaceResponse {
  // Text generation response
  generated_text?: string;
  
  // Summarization response
  summary_text?: string;
  
  // Translation response
  translation_text?: string;
  
  // Classification/sentiment response
  label?: string;
  score?: number;
  labels?: string[];
  scores?: number[];
  
  // Embeddings response
  embedding?: number[];
  
  // General error field
  error?: string;
  
  // Passthrough for other responses
  [key: string]: unknown;
}

export interface TextGenerationParams {
  model?: string;
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    do_sample?: boolean;
    return_full_text?: boolean;
  };
}

export interface SummarizationParams {
  model?: string;
  inputs: string;
  parameters?: {
    max_length?: number;
    min_length?: number;
    max_new_tokens?: number;
    min_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface TranslationParams {
  model?: string;
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
  };
}

export interface SentimentAnalysisParams {
  model?: string;
  inputs: string;
}

export interface EmbeddingsParams {
  model?: string;
  inputs: string;
}

export interface ZeroShotClassificationParams {
  model?: string;
  inputs: string | string[];
  parameters: {
    candidate_labels: string[];
    multi_label?: boolean;
    hypothesis_template?: string;
  };
}

// Default models for each task
const DEFAULT_MODELS = {
  textGeneration: 'gpt2',
  summarization: 'facebook/bart-large-cnn',
  translation: 'facebook/mbart-large-50-many-to-many-mmt',
  sentimentAnalysis: 'distilbert-base-uncased-finetuned-sst-2-english',
  embeddings: 'sentence-transformers/all-MiniLM-L6-v2',
  zeroShotClassification: 'facebook/bart-large-mnli',
};

/**
 * Query HuggingFace Inference API
 */
async function queryHF<T = HuggingFaceResponse>(
  endpoint: string,
  payload: unknown,
  model?: string
): Promise<T> {
  const url = model 
    ? `${HF_CONFIG.baseUrl}/models/${model}`
    : `${HF_CONFIG.baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HF_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: HF_CONFIG.headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalApiError(
        errorData.error || `HuggingFace API error: ${response.status}`
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ExternalApiError('Request timeout');
    }
    throw new ExternalApiError(ERROR_MESSAGES.EXTERNAL_API_ERROR);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Text Generation - Generate text from a prompt
 */
export async function generateText(params: TextGenerationParams): Promise<{ text: string }> {
  const { inputs, parameters = {}, model = DEFAULT_MODELS.textGeneration } = params;
  
  if (!inputs || inputs.trim().length === 0) {
    throw new ValidationError('Input text is required');
  }

  // Check cache
  const cacheKey = `hf:generate:${model}:${inputs.substring(0, 50)}:${JSON.stringify(parameters)}`;
  const cached = cache.get<{ text: string }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const payload = {
    inputs,
    parameters: {
      max_new_tokens: parameters.max_new_tokens || 100,
      temperature: parameters.temperature || 0.7,
      top_p: parameters.top_p || 0.9,
      top_k: parameters.top_k || 50,
      repetition_penalty: parameters.repetition_penalty || 1.0,
      do_sample: parameters.do_sample !== false,
      return_full_text: parameters.return_full_text !== false,
      ...parameters,
    },
  };

  const response = await queryHF<HuggingFaceResponse>(
    '',
    payload,
    model
  );

  const text = (response as { generated_text?: string }).generated_text;
  
  if (!text) {
    throw new ExternalApiError('No generated text returned');
  }

  const result = { text };
  
  // Cache for 5 minutes
  cache.set(cacheKey, result, cacheTTL.default);
  
  return result;
}

/**
 * Summarization - Summarize long text
 */
export async function summarizeText(params: SummarizationParams): Promise<{ summary: string }> {
  const { inputs, parameters = {}, model = DEFAULT_MODELS.summarization } = params;
  
  if (!inputs || inputs.trim().length === 0) {
    throw new ValidationError('Input text is required');
  }

  // Check cache
  const cacheKey = `hf:summarize:${model}:${inputs.substring(0, 50)}`;
  const cached = cache.get<{ summary: string }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const payload = {
    inputs,
    parameters: {
      max_length: parameters.max_length || 200,
      min_length: parameters.min_length || 30,
      max_new_tokens: parameters.max_new_tokens,
      min_new_tokens: parameters.min_new_tokens,
      temperature: parameters.temperature,
      top_p: parameters.top_p,
      top_k: parameters.top_k,
    },
  };

  const response = await queryHF<HuggingFaceResponse>(
    '',
    payload,
    model
  );

  const summary = (response as { summary_text?: string }).summary_text;
  
  if (!summary) {
    throw new ExternalApiError('No summary returned');
  }

  const result = { summary };
  
  // Cache for 10 minutes (summaries are more stable)
  cache.set(cacheKey, result, cacheTTL.jobDetail);
  
  return result;
}

/**
 * Translation - Translate text between languages
 */
export async function translateText(params: TranslationParams): Promise<{ translation: string }> {
  const { inputs, parameters = {}, model = DEFAULT_MODELS.translation } = params;
  
  if (!inputs || inputs.trim().length === 0) {
    throw new ValidationError('Input text is required');
  }

  // Check cache
  const cacheKey = `hf:translate:${model}:${inputs.substring(0, 50)}`;
  const cached = cache.get<{ translation: string }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const payload = {
    inputs,
    parameters: {
      max_new_tokens: parameters.max_new_tokens || 200,
      temperature: parameters.temperature || 0.7,
      top_p: parameters.top_p || 0.9,
    },
  };

  const response = await queryHF<HuggingFaceResponse>(
    '',
    payload,
    model
  );

  const translation = (response as { translation_text?: string }).translation_text;
  
  if (!translation) {
    throw new ExternalApiError('No translation returned');
  }

  const result = { translation };
  
  // Cache for 15 minutes
  cache.set(cacheKey, result, cacheTTL.categories);
  
  return result;
}

/**
 * Sentiment Analysis - Analyze text sentiment
 */
export async function analyzeSentiment(params: SentimentAnalysisParams): Promise<{
  label: string;
  score: number;
}> {
  const { inputs, model = DEFAULT_MODELS.sentimentAnalysis } = params;
  
  if (!inputs || inputs.trim().length === 0) {
    throw new ValidationError('Input text is required');
  }

  // Check cache
  const cacheKey = `hf:sentiment:${model}:${inputs.substring(0, 50)}`;
  const cached = cache.get<{ label: string; score: number }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const response = await queryHF<{ label: string; score: number }[]>(
    '',
    { inputs },
    model
  );

  const result = Array.isArray(response) ? response[0] : response;
  
  if (!result || !result.label) {
    throw new ExternalApiError('No sentiment analysis returned');
  }

  // Cache for 10 minutes
  cache.set(cacheKey, result, cacheTTL.jobDetail);
  
  return result;
}

/**
 * Text Embeddings - Get text embeddings
 */
export async function getEmbeddings(params: EmbeddingsParams): Promise<{
  embedding: number[];
  dimensions: number;
}> {
  const { inputs, model = DEFAULT_MODELS.embeddings } = params;
  
  if (!inputs || inputs.trim().length === 0) {
    throw new ValidationError('Input text is required');
  }

  // Check cache
  const cacheKey = `hf:embeddings:${model}:${inputs.substring(0, 50)}`;
  const cached = cache.get<{ embedding: number[]; dimensions: number }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const response = await queryHF<HuggingFaceResponse>(
    '',
    { inputs },
    model
  );

  const embedding = (response as { embedding?: number[] }).embedding;
  
  if (!embedding || !Array.isArray(embedding)) {
    throw new ExternalApiError('No embeddings returned');
  }

  const result = {
    embedding,
    dimensions: embedding.length,
  };
  
  // Cache embeddings for longer (1 hour)
  cache.set(cacheKey, result, 60 * 60 * 1000);
  
  return result;
}

/**
 * Zero-Shot Classification - Classify text without training
 */
export async function classifyZeroShot(params: ZeroShotClassificationParams): Promise<{
  labels: string[];
  scores: number[];
}> {
  const { inputs, parameters, model = DEFAULT_MODELS.zeroShotClassification } = params;
  
  if (!inputs || (Array.isArray(inputs) && inputs.length === 0)) {
    throw new ValidationError('Input text is required');
  }

  if (!parameters.candidate_labels || parameters.candidate_labels.length === 0) {
    throw new ValidationError('Candidate labels are required');
  }

  // Check cache
  const inputStr = Array.isArray(inputs) ? inputs.join('|') : inputs;
  const cacheKey = `hf:zeroshot:${model}:${inputStr.substring(0, 50)}:${parameters.candidate_labels.join(',')}`;
  const cached = cache.get<{ labels: string[]; scores: number[] }>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const response = await queryHF<{
    labels: string[];
    scores: number[];
  }[]>(
    '',
    { inputs, parameters },
    model
  );

  const result = Array.isArray(response) ? response[0] : response;
  
  if (!result || !result.labels) {
    throw new ExternalApiError('No classification results returned');
  }

  // Cache for 10 minutes
  cache.set(cacheKey, result, cacheTTL.jobDetail);
  
  return result;
}

/**
 * Get available models for each task
 */
export function getAvailableModels() {
  return {
    textGeneration: {
      default: DEFAULT_MODELS.textGeneration,
      options: [
        'gpt2',
        'gpt2-medium',
        'gpt2-large',
        'EleutherAI/gpt-neo-125M',
        'EleutherAI/gpt-neo-1.3B',
      ],
    },
    summarization: {
      default: DEFAULT_MODELS.summarization,
      options: [
        'facebook/bart-large-cnn',
        'facebook/bart-large-xsum',
        'google/pegasus-xsum',
        't5-small',
        't5-base',
      ],
    },
    translation: {
      default: DEFAULT_MODELS.translation,
      options: [
        'facebook/mbart-large-50-many-to-many-mmt',
        'facebook/mbart-large-50-many-to-one-mmt',
        'Helsinki-NLP/opus-mt-en-es',
        'Helsinki-NLP/opus-mt-en-fr',
      ],
    },
    sentimentAnalysis: {
      default: DEFAULT_MODELS.sentimentAnalysis,
      options: [
        'distilbert-base-uncased-finetuned-sst-2-english',
        'cardiffnlp/twitter-roberta-base-sentiment',
        'bhadresh-savani/bert-base-uncased-emotion',
      ],
    },
    embeddings: {
      default: DEFAULT_MODELS.embeddings,
      options: [
        'sentence-transformers/all-MiniLM-L6-v2',
        'sentence-transformers/all-mpnet-base-v2',
        'bert-base-uncased',
      ],
    },
    zeroShotClassification: {
      default: DEFAULT_MODELS.zeroShotClassification,
      options: [
        'facebook/bart-large-mnli',
        'facebook/nllb-200-distilled-600M',
        'typeform/distilbert-base-uncased-mnli',
      ],
    },
  };
}

/**
 * Check if HuggingFace API is configured
 */
export function isConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_TOKEN;
}

export default {
  generateText,
  summarizeText,
  translateText,
  analyzeSentiment,
  getEmbeddings,
  classifyZeroShot,
  getAvailableModels,
  isConfigured,
};
