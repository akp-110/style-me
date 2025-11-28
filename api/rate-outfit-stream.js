/* eslint-env node */
/* global process */

import { setCorsHeaders } from './middleware/cors.js';

// api/rate-outfit-stream.js - Streaming endpoint
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
        const { image, prompt, mode = 'balanced', mediaType = 'image/jpeg', detailedMode = false } = req.body;

        console.log('Received streaming request, mediaType:', mediaType, 'detailedMode:', detailedMode);

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

        // Adjust max_tokens based on detailed mode
        const maxTokens = detailedMode ? 1500 : 600; // Detailed: comprehensive, Concise: quick
        console.log('Using max_tokens:', maxTokens, '(detailedMode:', detailedMode, ')');

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

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
                stream: true, // Enable streaming
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    res.write('data: [DONE]\n\n');
                    res.end();
                    break;
                }

                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });

                // Parse SSE format from Claude
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        // Skip ping events
                        if (data === 'ping' || data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);

                            // Send content deltas to client
                            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                res.write(`data: ${JSON.stringify({ type: 'text', content: parsed.delta.text })}\n\n`);
                            }

                            // Send completion event
                            if (parsed.type === 'message_stop') {
                                res.write('data: [DONE]\n\n');
                            }
                        } catch (parseError) {
                            // Skip unparseable chunks
                            console.error('Error parsing chunk:', parseError);
                        }
                    }
                }
            }
        } catch (streamError) {
            console.error('Stream error:', streamError);
            res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error('Error:', error);

        // If headers not sent, send JSON error
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Internal server error' });
        } else {
            // If streaming already started, send error event
            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
            res.end();
        }
    }
}
