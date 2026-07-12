import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Zap, AlertCircle } from 'lucide-react';

/**
 * UsageIndicator - Shows remaining ratings for the month as a bordered chip.
 */
export function UsageIndicator({ compact = false, onClick }) {
    const { tier, remaining, loading, getRemainingText } = useSubscription();

    if (loading) return null;

    if (tier === 'style_pro') {
        return (
            <button onClick={onClick} className="chip-hard btn-press shadow-hard-sm bg-ink text-acid" title="Unlimited ratings">
                <Zap className="w-3 h-3" fill="currentColor" />
                <span>Pro</span>
            </button>
        );
    }

    const out = remaining <= 0;
    return (
        <button
            onClick={onClick}
            className={`chip-hard btn-press shadow-hard-sm ${out ? 'bg-ink text-acid' : ''}`}
            title={out ? 'Out of ratings — upgrade for more' : `${remaining} ratings left this month`}
        >
            {out && <AlertCircle className="w-3 h-3" />}
            <span>{getRemainingText()}{compact ? '' : ' left'}</span>
        </button>
    );
}
