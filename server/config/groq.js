// server/config/groq.js

import Groq from 'groq-sdk';

let groqClient = null;

// Circuit breaker state
let aiDisabledUntil = 0; // timestamp ms until which AI calls are disabled

// Model configuration - use supported model as primary per requirements
const MODEL_CONFIG = {
  primary: 'llama-3.1-8b-instant',
  fallback: 'llama-3.1-8b-instant',
  deprecated: ['llama3-70b-8192'],
};

const CIRCUIT_BREAKER_MS = 60 * 1000; // 60 seconds disable after failure

class GroqError extends Error {
  constructor(message, code = 'GROQ_ERROR', status = 500) {
    super(message);
    this.name = 'GroqError';
    this.code = code;
    this.status = status;
  }
}

const initializeGroqClient = () => {
  if (groqClient) return groqClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[GROQ] CRITICAL ERROR: GROQ_API_KEY is missing from environment variables!');
    return null;
  }

  console.log('[GROQ] Initializing Groq client');
  groqClient = new Groq({ apiKey });
  return groqClient;
};

export const isGroqConfigured = () => {
  return !!process.env.GROQ_API_KEY;
};

export const getGroqModels = () => ({ primary: MODEL_CONFIG.primary, fallback: MODEL_CONFIG.fallback });

export const isCircuitOpen = () => Date.now() < aiDisabledUntil;

export const disableCircuit = (reason) => {
  aiDisabledUntil = Date.now() + CIRCUIT_BREAKER_MS;
  console.warn(`[GROQ] Circuit opened for ${CIRCUIT_BREAKER_MS}ms due to: ${reason}`);
};

export const isGroqHealthy = async () => {
  // If circuit is open, immediately unhealthy
  if (isCircuitOpen()) return { healthy: false, reason: 'circuit_open' };

  const client = initializeGroqClient();
  if (!client) return { healthy: false, reason: 'not_configured' };

  try {
    // Lightweight check: do not call expensive completions, rely on client presence
    return { healthy: true };
  } catch (err) {
    return { healthy: false, reason: 'check_failed' };
  }
};

/**
 * Generate text from a prompt using Groq with fallback model support.
 * Enforces circuit breaker and returns structured errors with codes/status.
 * Accepts either a string prompt or an object {system, user, context}
 */
export const generateGroqText = async (promptOrOpts) => {
  if (isCircuitOpen()) {
    throw new GroqError('AI temporarily unavailable. Try again later.', 'SERVICE_UNAVAILABLE', 503);
  }

  const client = initializeGroqClient();
  if (!client) {
    throw new GroqError('Groq API key missing', 'API_KEY_MISSING', 500);
  }

  // Normalize messages
  let messages = [];
  if (typeof promptOrOpts === 'string') {
    messages = [{ role: 'user', content: promptOrOpts }];
  } else if (promptOrOpts && typeof promptOrOpts === 'object') {
    if (promptOrOpts.system) messages.push({ role: 'system', content: promptOrOpts.system });
    if (promptOrOpts.user) messages.push({ role: 'user', content: promptOrOpts.user });
    if (Array.isArray(promptOrOpts.messages)) messages = promptOrOpts.messages;
  } else {
    throw new GroqError('Invalid prompt format', 'BAD_REQUEST', 400);
  }

  const model = MODEL_CONFIG.primary;

  try {
    const completion = await client.chat.completions.create({ model, messages, temperature: 0.0 });
    const content = completion?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new GroqError('Invalid response from Groq', 'INVALID_RESPONSE', 502);
    }
    return content;
  } catch (err) {
    // Map known Groq SDK errors to structured GroqError
    const message = (err?.message || '').toString();

    if (/401|API key|invalid key/i.test(message)) {
      disableCircuit('invalid_api_key');
      throw new GroqError('Invalid Groq API key', 'API_KEY_INVALID', 401);
    }
    if (/quota|quota exceeded|insufficient credits|billing/i.test(message)) {
      disableCircuit('quota_exhausted');
      throw new GroqError('Groq quota or billing issue', 'QUOTA_EXCEEDED', 403);
    }
    if (/too many requests|rate limit/i.test(message) || err?.status === 429) {
      disableCircuit('rate_limited');
      throw new GroqError('Rate limit exceeded', 'RATE_LIMIT', 429);
    }
    if (/decommission|model_decommissioned|decommissioned/i.test(message)) {
      disableCircuit('model_decommissioned');
      throw new GroqError('Requested model is decommissioned', 'MODEL_DECOMMISSIONED', 503);
    }
    if (/503|service unavailable|temporarily unavailable/i.test(message) || err?.status === 503) {
      disableCircuit('service_unavailable');
      throw new GroqError('AI service temporarily unavailable', 'SERVICE_UNAVAILABLE', 503);
    }

    // Unknown error - open circuit briefly and return generic error
    disableCircuit('unknown_error');
    throw new GroqError('AI service error', 'GROQ_ERROR', 502);
  }
};


