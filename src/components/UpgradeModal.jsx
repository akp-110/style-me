import React, { useState } from 'react';
import { X, Check, Cloud, Crown } from 'lucide-react';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '£0',
        period: 'forever',
        ratings: '20/month',
        description: 'Try out the basics',
        features: [
            { name: 'AI outfit ratings', included: true },
            { name: '4 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: false },
            { name: 'Weather context', included: false },
            { name: 'Calendar integration', included: false },
            { name: 'Color analysis', included: false },
        ],
        buttonText: 'Current Plan',
        buttonStyle: 'bg-stone text-ink/40 cursor-default',
        highlight: false
    },
    {
        id: 'style_plus',
        name: 'Style+',
        price: '£4.99',
        period: '/month',
        ratings: '100/month',
        description: 'Perfect for daily styling',
        features: [
            { name: 'AI outfit ratings', included: true },
            { name: '4 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: true },
            { name: 'Weather context', included: true },
            { name: 'Calendar integration', included: true },
            { name: 'Color analysis', included: false },
        ],
        buttonText: 'Upgrade to Style+',
        buttonStyle: 'bg-acid shadow-hard',
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
            { name: '4 advisor personalities', included: true },
            { name: 'Product suggestions', included: true },
            { name: 'Save outfits', included: true },
            { name: 'Weather context', included: true },
            { name: 'Calendar integration', included: true },
            { name: 'Advanced color analysis', included: true },
        ],
        buttonText: 'Go Pro',
        buttonStyle: 'bg-ink text-acid shadow-hard',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
            <div className="relative bg-paper max-w-4xl w-full max-h-[90vh] overflow-y-auto border-[3px] border-ink shadow-hard-lg">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 chip-hard btn-press shadow-hard-sm z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                        Upgrade Your Style Game
                    </h2>
                    <p className="text-ink/60 text-sm">
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
                                className={`relative p-5 border-[3px] transition-all ${plan.highlight
                                        ? 'bg-white border-ink shadow-hard'
                                        : 'bg-white border-ink'
                                    }`}
                            >
                                {/* Popular badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 chip-hard bg-acid">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="text-center mb-6">
                                    {Icon && (
                                        <Icon className="w-6 h-6 mx-auto mb-2" />
                                    )}
                                    <h3 className="label-caps">{plan.name}</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-black">{plan.price}</span>
                                        <span className="text-ink/50 text-sm">{plan.period}</span>
                                    </div>
                                    <p className="text-ink/50 text-sm mt-1">{plan.description}</p>
                                    <div className="mt-2 inline-block chip-hard">
                                        <span className="text-ink">
                                            {plan.ratings} ratings
                                        </span>
                                    </div>
                                </div>

                                {/* Features list */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-ink flex-shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 text-ink/30 flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? 'text-ink/80 text-sm' : 'text-ink/35 text-sm line-through'}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isCurrentPlan || loading === plan.id}
                                    className={`w-full py-3 border-[3px] border-ink font-black uppercase tracking-wide text-sm btn-press ${isCurrentPlan
                                            ? 'bg-stone text-ink/40 cursor-default'
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
                    <p className="text-ink/50 text-xs">
                        Cancel anytime. Prices in GBP. Secure payment via Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
