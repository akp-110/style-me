import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

/**
 * UsageIndicator - Shows remaining ratings for the month as a bordered chip.
 *
 * Reads from the shared subscription instance owned by App (passed in via the
 * `subscription` prop) — it must NOT call useSubscription() itself. That hook
 * is plain useState with no context, so a second call would create an isolated
 * copy that never sees App's bumpUsageCount() after a rating (chip stuck at N/N).
 */
export function UsageIndicator({ subscription, compact = false, onClick }) {
    const { tier, remaining, loading, getRemainingText } = subscription;

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
