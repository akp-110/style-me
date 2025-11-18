/* eslint-env node */
/* global process */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OpenWeather API key not found');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q.trim())}&limit=5&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`OpenWeather API error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch suggestions' });
    }

    const data = await response.json();

    // Format the response to be more user-friendly
    const suggestions = data.map(location => ({
      name: location.name,
      country: location.country,
      state: location.state,
      lat: location.lat,
      lon: location.lon,
      displayName: location.state
        ? `${location.name}, ${location.state}, ${location.country}`
        : `${location.name}, ${location.country}`
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching weather suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
