import { useState, useCallback } from 'react';

/**
 * Hook for enhanced outfit analysis with color extraction and recommendations
 */
export const useOutfitAnalysis = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyzeOutfit = useCallback(async (imageBase64, mediaType = 'image/jpeg', userPreferences = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze-outfit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageBase64,
                    mediaType,
                    userPreferences
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            setAnalysis(data.analysis);
            return data.analysis;

        } catch (err) {
            console.error('Outfit analysis error:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAnalysis = useCallback(() => {
        setAnalysis(null);
        setError(null);
    }, []);

    return {
        analysis,
        loading,
        error,
        analyzeOutfit,
        clearAnalysis
    };
};
