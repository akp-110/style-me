// api/weather.js
/* eslint-env node */
/* global process */

import { setCorsHeaders } from './middleware/cors.js';

export default async function handler(req, res) {
  // Enable CORS
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lat, lon, q } = req.query || {};

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenWeather API key not configured on server' });
    }

    let url = '';
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}&units=metric`;
    } else if (q) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${encodeURIComponent(apiKey)}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Missing lat/lon or q parameter' });
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Weather API error', raw: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Weather proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
