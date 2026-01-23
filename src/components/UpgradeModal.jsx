import React, { useState } from 'react';
import { X, Check, Zap, Cloud, Calendar, Palette, Sparkles, Crown } from 'lucide-react';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '£0',
        period: 'forever',
        ratings: '3/month',
        description: 'Try out the basics',
        features: [
            { name: 'AI outfit ratings', included: true },
            { name: '5 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: false },
            { name: 'Weather context', included: false },
            { name: 'Calendar integration', included: false },
            { name: 'Color analysis', included: false },
        ],
        buttonText: 'Current Plan',
        buttonStyle: 'bg-slate-700 text-slate-400 cursor-default',
        highlight: false
    },
    {
        id: 'style_plus',
        name: 'Style+',
        price: '£4.99',
        period: '/month',
        ratings: '50/month',
        description: 'Perfect for daily styling',
        features: [
            { name: 'AI outfit ratings', included: true },
            { name: '5 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: true },
            { name: 'Weather context', included: true },
            { name: 'Calendar integration', included: true },
            { name: 'Color analysis', included: false },
        ],
        buttonText: 'Upgrade to Style+',
        buttonStyle: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white',
        highlight: true,
        icon: Cloud
    },
    {
        id: 'style_pro',
        name: 'Style Pro',
        price: '£10.99',
        period: '/month',
        ratings: 'Unlimited',
        description: 'For fashion enthusiasts',
        features: [
            { name: 'AI outfit ratings', included: true },
            { name: '5 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: true },
            { name: 'Weather context', included: true },
            { name: 'Calendar integration', included: true },
            { name: 'Advanced color analysis', included: true },
        ],
        buttonText: 'Go Pro',
        buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
        highlight: false,
        icon: Crown
    }
];

export function UpgradeModal({ isOpen, onClose, currentTier = 'free', onSelectPlan }) {
    const [loading, setLoading] = useState(null);

    if (!isOpen) return null;

    const handleSelectPlan = async (planId) => {
        if (planId === currentTier || planId === 'free') return;

        setLoading(planId);
        try {
            await onSelectPlan?.(planId);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-6">
                    <h2 className="text-3xl font-black text-white mb-2">
                        Upgrade Your Style Game
                    </h2>
                    <p className="text-slate-400">
                        Get more ratings and unlock premium features
                    </p>
                </div>

                {/* Plans grid */}
                <div className="grid md:grid-cols-3 gap-4 p-6">
                    {PLANS.map((plan) => {
                        const isCurrentPlan = plan.id === currentTier;
                        const Icon = plan.icon;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-6 border transition-all ${plan.highlight
                                        ? 'bg-gradient-to-b from-orange-900/30 to-slate-800/50 border-orange-500/50 scale-105'
                                        : 'bg-slate-800/50 border-slate-700/50'
                                    }`}
                            >
                                {/* Popular badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="text-center mb-6">
                                    {Icon && (
                                        <Icon className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                                    )}
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-black text-white">{plan.price}</span>
                                        <span className="text-slate-400">{plan.period}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
                                    <div className="mt-2 inline-block px-3 py-1 bg-slate-700/50 rounded-full">
                                        <span className="text-orange-400 font-semibold text-sm">
                                            {plan.ratings} ratings
                                        </span>
                                    </div>
                                </div>

                                {/* Features list */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isCurrentPlan || loading === plan.id}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrentPlan
                                            ? 'bg-slate-700 text-slate-400 cursor-default'
                                            : plan.buttonStyle
                                        } disabled:opacity-50`}
                                >
                                    {loading === plan.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : isCurrentPlan ? (
                                        'Current Plan'
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center pb-8 px-6">
                    <p className="text-slate-500 text-sm">
                        Cancel anytime. Prices in GBP. Secure payment via Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
