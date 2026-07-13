/* eslint-env node */

/**
 * API Configuration Constants
 */

// Mode-specific token limits for Claude API.
// Must cover the full structured template (rating, summary, breakdown,
// what works, suggestions) PLUS any optional sections the prompt adds
// (weather check, calendar compatibility, roast) PLUS the model's own
// occasional closing thought ("The Bigger Picture" etc.) — personas are
// prompted to write in a discursive, detailed voice, so a tight budget
// truncates that trailing content mid-sentence instead of a clean stop.
export const MODE_TOKEN_LIMITS = {
    professional: 1400,
    balanced: 1200,
    hype: 1000,
    roast: 1000
};

export const DEFAULT_TOKEN_LIMIT = 1200;

// Server-enforced usage limits, per action type ('rating' and 'analysis'
// are counted separately, each at this cap). Tune here — one-line change.
export const RATE_LIMITS = {
    guest: { limit: 5, window: 'rolling7d' },
    free: { limit: 20, window: 'month' },
    style_plus: { limit: 100, window: 'month' },
    style_pro: { limit: Infinity, window: 'month' }
};
