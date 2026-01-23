/* eslint-env node */
/* global process */

import { setCorsHeaders } from './middleware/cors.js';

/**
 * Enhanced Outfit Analysis API
 * Returns structured JSON with colors, style tags, gaps, and recommendations
 */
export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, mediaType = 'image/jpeg', userPreferences = {} } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Missing image' });
        }

        // Validate media type
        const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const normalizedMediaType = validMediaTypes.includes(mediaType) ? mediaType : 'image/jpeg';

        // Build the analysis prompt with color theory
        const analysisPrompt = `You are a fashion analyst with expertise in color theory and styling. Analyze this outfit image and return a JSON object with the following structure:

{
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode", 
    "accent": "#hexcode",
    "neutrals": ["#hex1", "#hex2"],
    "palette_type": "monochromatic|analogous|complementary|triadic|split-complementary"
  },
  "style_tags": ["casual", "formal", "streetwear", etc - max 5 tags],
  "garments": [
    {
      "type": "top|bottom|outerwear|footwear|accessory",
      "description": "Brief description",
      "color": "#hexcode",
      "fit": "loose|regular|slim|oversized"
    }
  ],
  "style_analysis": {
    "current_aesthetic": "Describe the overall vibe in 1-2 words",
    "proportion_score": 1-10,
    "color_harmony_score": 1-10,
    "occasion_versatility": ["casual", "work", "evening", etc]
  },
  "improvement_gaps": [
    {
      "category": "accessory|layering|color|footwear|proportion",
      "issue": "What's missing or could be improved",
      "suggestion": "Specific recommendation",
      "search_terms": ["keywords to search for products"]
    }
  ],
  "recommended_additions": [
    {
      "item_type": "belt|watch|bag|jacket|scarf|shoes|etc",
      "reason": "Why this would improve the outfit",
      "color_recommendation": "#hexcode that complements current outfit",
      "style_recommendation": "Specific style suggestion",
      "search_query": "e.g., 'brown leather belt mens casual'"
    }
  ],
  "color_theory_notes": "Brief explanation of how colors work together or could be improved"
}

${userPreferences.favoriteColors?.length > 0 ? `User's favorite colors: ${userPreferences.favoriteColors.join(', ')}` : ''}
${userPreferences.preferredStyles?.length > 0 ? `User's preferred styles: ${userPreferences.preferredStyles.join(', ')}` : ''}
${userPreferences.favoriteBrands?.length > 0 ? `User's favorite brands (consider these for recommendations): ${userPreferences.favoriteBrands.join(', ')}` : ''}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or explanations. Extract actual hex colors from the image.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 2000,
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
                                text: analysisPrompt
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

        // Parse the JSON response from Claude
        const textContent = data.content?.[0]?.text;
        if (!textContent) {
            throw new Error('No analysis content received');
        }

        // Try to parse the JSON, handling potential markdown code blocks
        let analysis;
        try {
            // Remove potential markdown code blocks
            const cleanedText = textContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            analysis = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse analysis JSON:', parseError);
            console.error('Raw text:', textContent);
            throw new Error('Failed to parse outfit analysis');
        }

        res.status(200).json({
            success: true,
            analysis,
            usage: data.usage
        });

    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}
