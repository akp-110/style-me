import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Tier limits configuration
const TIER_LIMITS = {
    free: 3,
    style_plus: 50,
    style_pro: Infinity
};

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
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    // Calculate usage limit based on tier
    const usageLimit = TIER_LIMITS[tier] || 3;
    const remaining = tier === 'style_pro' ? Infinity : Math.max(0, usageLimit - usageCount);

    // Fetch subscription and usage data
    const fetchSubscriptionData = useCallback(async () => {
        if (!user) {
            setTier('free');
            setUsageCount(0);
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

            // Fetch monthly usage count
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

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
        } catch (err) {
            console.error('Subscription fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Log a usage action
    const logUsage = async (actionType = 'rating') => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('usage_logs')
                .insert({ user_id: user.id, action_type: actionType });

            if (error) throw error;

            setUsageCount(prev => prev + 1);
            return true;
        } catch (err) {
            console.error('Error logging usage:', err);
            return false;
        }
    };

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
        loading,
        subscription,

        // Methods
        canRate,
        canUseFeature,
        logUsage,
        refreshSubscription: fetchSubscriptionData,
        getResetDate,
        getRemainingText,

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

        if (daysSince >= 7) {
            return { canRate: true, daysLeft: 0 };
        }
        return { canRate: false, daysLeft: Math.ceil(7 - daysSince) };
    };

    const logGuestRating = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            lastRating: new Date().toISOString(),
            count: (getGuestData().count || 0) + 1
        }));
    };

    return { checkGuestCanRate, logGuestRating };
}
