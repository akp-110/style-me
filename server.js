/* eslint-env node */
/* global process */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import url from 'url';

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple passthrough to handlers in /api
import weatherHandler from './api/weather.js';
import rateOutfitHandler from './api/rate-outfit.js';
import suggestionsHandler from './api/weather-suggestions.js';
import analyzeOutfitHandler from './api/analyze-outfit.js';
import searchProductsHandler from './api/search-products.js';

app.options('/api/*', (req, res) => res.sendStatus(200));

app.get('/api/weather', (req, res) => weatherHandler(req, res));
app.post('/api/rate-outfit', (req, res) => rateOutfitHandler(req, res));
app.post('/api/analyze-outfit', (req, res) => analyzeOutfitHandler(req, res));
app.post('/api/search-products', (req, res) => searchProductsHandler(req, res));
app.get('/api/weather-suggestions', (req, res) => suggestionsHandler(req, res));

app.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}`);
});
