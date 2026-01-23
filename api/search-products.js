/* eslint-env node */
/* global process */

import { setCorsHeaders } from './middleware/cors.js';

/**
 * Product Search API
 * Uses RapidAPI Real-Time Product Search to find fashion items
 * Free tier: 100 requests/month
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
        const {
            query,
            category = 'fashion',
            minPrice = 0,
            maxPrice = 500,
            stores = ['H&M', 'ASOS', 'Amazon'],
            country = 'US', // Default to US
            limit = 8
        } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Missing search query' });
        }

        // Check if RapidAPI key is configured
        const rapidApiKey = process.env.RAPIDAPI_KEY;

        if (!rapidApiKey) {
            // Return mock data for development/demo
            console.warn('RAPIDAPI_KEY not configured, returning mock data');
            return res.status(200).json({
                success: true,
                products: generateMockProducts(query, country, limit),
                source: 'mock',
                message: 'Using mock data. Add RAPIDAPI_KEY to .env for real results.'
            });
        }

        // Build search query - keep it simple to get more results
        const searchQuery = `${query} fashion`;

        // Note: sort, product_condition, min_price, max_price filters often return 0 results
        // Using simpler query for better compatibility
        const apiUrl = `https://real-time-product-search.p.rapidapi.com/search-v2?q=${encodeURIComponent(searchQuery)}&country=${country.toLowerCase()}&language=en&limit=${limit}`;

        // Call RapidAPI Real-Time Product Search (v2 endpoint)
        const response = await fetch(
            apiUrl,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'real-time-product-search.p.rapidapi.com'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('RapidAPI error:', response.status, errorText);

            // Return empty products with error info
            return res.status(200).json({
                success: true,
                products: [],
                source: 'api_error',
                message: `Product search unavailable (Error ${response.status}). Please try again later.`
            });
        }

        const data = await response.json();

        // Transform results to consistent format (v2 API has products at data.data.products)
        const productList = data.data?.products || [];
        const products = productList.map(item => ({
            id: item.product_id || item.asin || Math.random().toString(36).substr(2, 9),
            title: item.product_title || item.title,
            price: item.offer?.price || item.typical_price_range?.[0] || 'Price varies',
            image: item.product_photos?.[0] || item.thumbnail,
            url: item.offer?.offer_page_url || item.product_page_url || item.link,
            store: item.offer?.store_name || extractStoreName(item.offer?.offer_page_url || item.product_page_url || ''),
            rating: item.product_rating || null,
            reviewCount: item.product_num_reviews || 0
        })).filter(p => p.title && p.image);

        res.status(200).json({
            success: true,
            products,
            source: 'rapidapi',
            totalResults: productList.length
        });

    } catch (error) {
        console.error('Product search error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to search products'
        });
    }
}

/**
 * Extract store name from URL
 */
function extractStoreName(url) {
    if (!url) return 'Unknown';
    if (url.includes('amazon')) return 'Amazon';
    if (url.includes('hm.com') || url.includes('h&m')) return 'H&M';
    if (url.includes('asos')) return 'ASOS';
    if (url.includes('zara')) return 'Zara';
    if (url.includes('nordstrom')) return 'Nordstrom';
    if (url.includes('target')) return 'Target';
    if (url.includes('walmart')) return 'Walmart';
    return 'Online Store';
}

/**
 * Generate mock products for development
 */
function generateMockProducts(query, country = 'US', limit = 8) {
    const mockImages = [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop'
    ];

    const stores = ['H&M', 'ASOS', 'Amazon', 'Zara'];

    // Currency mapping
    const currencyMap = {
        'US': '$',
        'GB': '£',
        'CA': 'C$',
        'AU': 'A$'
    };
    const symbol = currencyMap[country] || '$';

    const prices = [`${symbol}29.99`, `${symbol}45.00`, `${symbol}59.99`, `${symbol}35.00`, `${symbol}79.99`, `${symbol}24.99`];

    return Array.from({ length: Math.min(limit, 8) }, (_, i) => ({
        id: `mock-${i}-${Date.now()}`,
        title: `${query} - Style ${i + 1} (${country})`,
        price: prices[i % prices.length],
        image: mockImages[i % mockImages.length],
        url: '#',
        store: stores[i % stores.length],
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500) + 50
    }));
}
