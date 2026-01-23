import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Lock, Sparkles } from 'lucide-react';

/**
 * FeatureGate - Wraps content that requires specific tier access
 * Shows upgrade prompt if user doesn't have access
 */
export function FeatureGate({
    feature,
    children,
    fallback = null,
    showLock = true,
    onUpgradeClick
}) {
    const { canUseFeature, tier } = useSubscription();

    if (canUseFeature(feature)) {
        return children;
    }

    // If no fallback provided and showLock is false, render nothing
    if (!fallback && !showLock) {
        return null;
    }

    // If custom fallback provided, use it
    if (fallback) {
        return fallback;
    }

    // Default locked state
    return (
        <div className="relative">
            <div className="opacity-50 pointer-events-none blur-[1px]">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg"
                >
                    <Lock className="w-4 h-4" />
                    <span>Upgrade to unlock</span>
                </button>
            </div>
        </div>
    );
}

/**
 * FeatureBadge - Shows a small badge for locked features
 */
export function FeatureBadge({ feature, requiredTier = 'style_plus' }) {
    const { canUseFeature } = useSubscription();

    if (canUseFeature(feature)) {
        return null;
    }

    const tierLabels = {
        style_plus: 'Style+',
        style_pro: 'Pro'
    };

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
            <Sparkles className="w-3 h-3" />
            {tierLabels[requiredTier] || 'Upgrade'}
        </span>
    );
}
