/* eslint-env node */

/**
 * API Configuration Constants
 */

// Mode-specific token limits for Claude API
// Optimized to reduce costs while maintaining quality
export const MODE_TOKEN_LIMITS = {
    professional: 1000,
    balanced: 800,
    hype: 700,
    roast: 700
};

export const DEFAULT_TOKEN_LIMIT = 800;
