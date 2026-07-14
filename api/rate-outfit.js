/* eslint-env node */
/* global process */

import { applyCors } from './middleware/cors.js';
import { MODE_TOKEN_LIMITS, DEFAULT_TOKEN_LIMIT } from './config/constants.js';
import { reserveUsage, releaseUsage, gateResponseBody } from './middleware/enforceLimits.js';
import { InputError, validateRatingRequest } from './lib/requestValidation.js';
import { buildRatingPrompt } from './lib/ratingPrompt.js';

const PROVIDER_TIMEOUT_MS = 30_000;

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'method_not_allowed' });
  }

  let input;
  try {
    input = validateRatingRequest(req.body);
  } catch (error) {
    if (error instanceof InputError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    return res.status(400).json({ error: 'Invalid request', code: 'invalid_request' });
  }

  if (process.env.DISABLE_AI_ENDPOINTS === '1' || !process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Rating service is temporarily unavailable', code: 'provider_unavailable' });
  }

  const gate = await reserveUsage(req, 'rating');
  if (!gate.allowed) return res.status(gate.status).json(gateResponseBody(gate));

  const prompt = buildRatingPrompt(input.mode, input.context);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  let providerAccepted = false;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: MODE_TOKEN_LIMITS[input.mode] || DEFAULT_TOKEN_LIMIT,
        system: prompt.system,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: input.mediaType, data: input.image } },
            { type: 'text', text: prompt.user }
          ]
        }]
      })
    });

    if (!response.ok) {
      await releaseUsage(gate.reservation);
      return res.status(502).json({ error: 'Rating provider request failed', code: 'provider_error' });
    }

    providerAccepted = true;
    const data = await response.json();
    if (!data.content || !Array.isArray(data.content)) {
      return res.status(502).json({ error: 'Rating provider returned an invalid response', code: 'provider_error' });
    }
    return res.status(200).json(data);
  } catch {
    if (!providerAccepted) await releaseUsage(gate.reservation);
    return res.status(502).json({ error: 'Rating provider is temporarily unavailable', code: 'provider_error' });
  } finally {
    clearTimeout(timeout);
  }
}
