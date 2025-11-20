/* eslint-env node */
/* global process */

import { setCorsHeaders } from './middleware/cors.js';
import { MODE_TOKEN_LIMITS, DEFAULT_TOKEN_LIMIT } from './config/constants.js';

// api/rate-outfit.js
export default async function handler(req, res) {
  // Enable CORS
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, prompt, mode = 'balanced', mediaType = 'image/jpeg' } = req.body;

    console.log('Received mediaType:', mediaType);

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    // Validate and normalize media type
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    let normalizedMediaType = mediaType;

    if (!validMediaTypes.includes(mediaType)) {
      console.warn(`Invalid media type ${mediaType}, defaulting to image/jpeg`);
      normalizedMediaType = 'image/jpeg';
    }

    console.log('Using mediaType:', normalizedMediaType);

    // Determine max_tokens based on mode for cost optimization
    const maxTokens = MODE_TOKEN_LIMITS[mode] || DEFAULT_TOKEN_LIMIT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: normalizedMediaType,
                  data: image
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
