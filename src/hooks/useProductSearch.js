import { useState, useCallback } from 'react';

/**
 * Hook for searching and managing product recommendations
 */
export const useProductSearch = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const searchProducts = useCallback(async (query, options = {}) => {
        if (!query) return;

        setLoading(true);
        setError(null);
        setSearchQuery(query);

        try {
            const response = await fetch('/api/search-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    category: options.category || 'fashion',
                    minPrice: options.minPrice || 0,
                    maxPrice: options.maxPrice || 500,
                    stores: options.stores || ['H&M', 'ASOS', 'Amazon'],
                    country: options.country || 'US',
                    limit: options.limit || 8
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Search failed');
            }

            setProducts(data.products || []);
            return data.products;

        } catch (err) {
            console.error('Product search error:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const clearProducts = useCallback(() => {
        setProducts([]);
        setSearchQuery('');
        setError(null);
    }, []);

    return {
        products,
        loading,
        error,
        searchQuery,
        searchProducts,
        clearProducts
    };
};
