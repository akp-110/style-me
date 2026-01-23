import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Zap, AlertCircle } from 'lucide-react';

/**
 * UsageIndicator - Shows remaining ratings for the month
 */
export function UsageIndicator({ compact = false, onClick }) {
    const { tier, usageCount, usageLimit, remaining, loading, getRemainingText } = useSubscription();

    if (loading) return null;

    // Pro users get a simple badge
    if (tier === 'style_pro') {
        return (
            <div
                className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium cursor-pointer hover:opacity-90 transition-opacity ${compact ? 'text-xs' : 'text-sm'}`}
                onClick={onClick}
                title="Unlimited ratings"
            >
                <Zap className={compact ? "w-3 h-3" : "w-4 h-4"} fill="currentColor" />
                <span>Pro</span>
            </div>
        );
    }

    // Calculate progress percentage
    const usagePercent = Math.min(100, (usageCount / usageLimit) * 100);

    // Color based on usage
    let colorClass = 'from-green-500 to-emerald-500';
    let textColor = 'text-green-400';
    if (usagePercent >= 80) {
        colorClass = 'from-red-500 to-orange-500';
        textColor = 'text-red-400';
    } else if (usagePercent >= 50) {
        colorClass = 'from-yellow-500 to-orange-500';
        textColor = 'text-yellow-400';
    }

    if (compact) {
        return (
            <button
                onClick={onClick}
                className={`flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 rounded-full text-xs font-medium ${textColor} hover:bg-slate-700/80 transition-colors`}
                title={`${remaining} ratings left this month`}
            >
                {remaining <= 0 && <AlertCircle className="w-3 h-3" />}
                <span>{getRemainingText()}</span>
            </button>
        );
    }

    return (
        <div
            className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 cursor-pointer hover:bg-slate-700/80 transition-colors"
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Ratings this month</span>
                <span className={`font-bold ${textColor}`}>{getRemainingText()}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                    style={{ width: `${usagePercent}%` }}
                />
            </div>
            {remaining <= 0 && (
                <p className="text-orange-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Upgrade for more ratings
                </p>
            )}
        </div>
    );
}
