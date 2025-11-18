/* eslint-env node */

/**
 * Shared CORS middleware for API endpoints
 * Enables cross-origin requests for all endpoints
 */
export const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

/**
 * Handle OPTIONS preflight requests
 */
export const handleCors = (req, res, next) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
};
