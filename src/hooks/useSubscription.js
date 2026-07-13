import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Tier limits configuration
const TIER_LIMITS = {
    free: 20,
    style_plus: 100,
    style_pro: Infinity
};

// Ratings a signed-out guest gets per rolling 7-day window
const GUEST_LIMIT = 5;

// Feature access by tier
const FEATURE_ACCESS = {
    basic_rating: ['free', 'style_plus', 'style_pro'],
    advisor_modes: ['free', 'style_plus', 'style_pro'],
    product_suggestions: ['free', 'style_plus', 'style_pro'],
    save_outfits: ['style_plus', 'style_pro'],
    weather_context: ['style_plus', 'style_pro'],
    calendar_integration: ['style_plus', 'style_pro'],
    style_profile: ['style_plus', 'style_pro'],
    color_analysis: ['style_pro'],
    outfit_comparison: ['style_pro']
};

export function useSubscription() {
    const { user } = useAuth();
    const [tier, setTier] = useState('free');
    const [usageCount, setUsageCount] = useState(0);
    const [analysisCount, setAnalysisCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    // Calculate usage limit based on tier. Ratings and analyses each have
    // their own monthly counter at the same cap (matches server enforcement).
    const usageLimit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
    const remaining = tier === 'style_pro' ? Infinity : Math.max(0, usageLimit - usageCount);
    const analysisRemaining = tier === 'style_pro' ? Infinity : Math.max(0, usageLimit - analysisCount);

    // Fetch subscription and usage data
    const fetchSubscriptionData = useCallback(async () => {
        if (!user) {
            setTier('free');
            setUsageCount(0);
            setAnalysisCount(0);
            setSubscription(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch subscription
            const { data: subData, error: subError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (subError && subError.code !== 'PGRST116') {
                console.error('Error fetching subscription:', subError);
            }

            if (subData) {
                setTier(subData.tier);
                setSubscription(subData);
            } else {
                // Create default subscription if none exists
                const { data: newSub } = await supabase
                    .from('user_subscriptions')
                    .insert({ user_id: user.id, tier: 'free' })
                    .select()
                    .single();

                if (newSub) {
                    setTier(newSub.tier);
                    setSubscription(newSub);
                }
            }

            // Fetch monthly usage count. UTC month start, matching the
            // server's enforcement window (api/lib/limitPolicy.js monthStart)
            // so the chip never disagrees with the server near boundaries.
            const now = new Date();
            const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

            const { count, error: usageError } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('action_type', 'rating')
                .gte('created_at', startOfMonth.toISOString());

            if (usageError) {
                console.error('Error fetching usage:', usageError);
            } else {
                setUsageCount(count || 0);
            }

            // Analyses are a separate monthly counter (own action_type).
            const { count: aCount, error: analysisErr } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('action_type', 'analysis')
                .gte('created_at', startOfMonth.toISOString());

            if (analysisErr) {
                console.error('Error fetching analysis usage:', analysisErr);
            } else {
                setAnalysisCount(aCount || 0);
            }
        } catch (err) {
            console.error('Subscription fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Usage rows are written by the API (single writer). These just keep
    // the on-screen counters in sync without a refetch.
    const bumpUsageCount = () => setUsageCount(prev => prev + 1);
    const bumpAnalysisCount = () => setAnalysisCount(prev => prev + 1);

    // Check if user can perform a rating
    const canRate = () => {
        if (tier === 'style_pro') return true;
        return usageCount < usageLimit;
    };

    // Check if user has access to a feature
    const canUseFeature = (featureName) => {
        const allowedTiers = FEATURE_ACCESS[featureName] || [];
        return allowedTiers.includes(tier);
    };

    // Get reset date (first of next month)
    const getResetDate = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    };

    // Format remaining as string
    const getRemainingText = () => {
        if (tier === 'style_pro') return '∞';
        return `${remaining}/${usageLimit}`;
    };

    const getAnalysisText = () => {
        if (tier === 'style_pro') return '∞';
        return `${analysisRemaining}/${usageLimit}`;
    };

    // Fetch on mount and user change
    useEffect(() => {
        fetchSubscriptionData();
    }, [fetchSubscriptionData]);

    return {
        // State
        tier,
        usageCount,
        usageLimit,
        remaining,
        analysisCount,
        analysisRemaining,
        loading,
        subscription,

        // Methods
        canRate,
        canUseFeature,
        bumpUsageCount,
        bumpAnalysisCount,
        refreshSubscription: fetchSubscriptionData,
        getResetDate,
        getRemainingText,
        getAnalysisText,

        // Constants for UI
        TIER_LIMITS,
        FEATURE_ACCESS
    };
}

// Guest usage tracking (localStorage)
export function useGuestUsage() {
    const STORAGE_KEY = 'stylesync_guest';

    const getGuestData = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    };

    const checkGuestCanRate = () => {
        const data = getGuestData();
        if (!data.lastRating) return { canRate: true, daysLeft: 0 };

        const lastRating = new Date(data.lastRating);
        const now = new Date();
        const daysSince = (now - lastRating) / (1000 * 60 * 60 * 24);

        // A full week since the last rating resets the window.
        if (daysSince >= 7) {
            return { canRate: true, daysLeft: 0 };
        }
        // Within the window, allow up to GUEST_LIMIT ratings.
        if ((data.count || 0) < GUEST_LIMIT) {
            return { canRate: true, daysLeft: 0 };
        }
        return { canRate: false, daysLeft: Math.ceil(7 - daysSince) };
    };

    const logGuestRating = () => {
        const data = getGuestData();
        const now = new Date();
        const lastRating = data.lastRating ? new Date(data.lastRating) : null;
        const withinWindow = lastRating && (now - lastRating) / (1000 * 60 * 60 * 24) < 7;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            lastRating: now.toISOString(),
            // Reset the count when a new weekly window starts.
            count: withinWindow ? (data.count || 0) + 1 : 1
        }));
    };

    return { checkGuestCanRate, logGuestRating };
}
