/* eslint-env node */

/**
 * API Configuration Constants
 */

// Mode-specific token limits for Claude API
// Optimized for speed while maintaining quality
export const MODE_TOKEN_LIMITS = {
    professional: 700,  // Reduced from 1000
    balanced: 600,      // Reduced from 800
    hype: 500,          // Reduced from 700
    roast: 500          // Reduced from 700
};

export const DEFAULT_TOKEN_LIMIT = 600;  // Reduced from 800

// Server-enforced usage limits, per action type ('rating' and 'analysis'
// are counted separately, each at this cap). Tune here — one-line change.
export const RATE_LIMITS = {
    guest: { limit: 5, window: 'rolling7d' },
    free: { limit: 20, window: 'month' },
    style_plus: { limit: 100, window: 'month' },
    style_pro: { limit: Infinity, window: 'month' }
};
