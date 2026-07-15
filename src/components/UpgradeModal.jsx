import React from 'react';
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
        buttonText: 'Unavailable in demo',
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
        buttonText: 'Unavailable in demo',
        buttonStyle: 'bg-ink text-acid shadow-hard',
        highlight: false,
        icon: Crown
    }
];

export function UpgradeModal({ isOpen, onClose, currentTier = 'free' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
            <div className="relative bg-paper max-w-4xl w-full max-h-[90vh] overflow-y-auto border-[3px] border-ink shadow-hard-lg">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close upgrade options"
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
                        Paid plans are shown for demonstration purposes only and are not available yet.
                    </p>
                </div>

                {/* Plans grid */}
                <div className="grid md:grid-cols-3 gap-4 p-6">
                    {PLANS.map((plan) => {
                        const isCurrentPlan = plan.id === currentTier;
                        const isPaidPlan = plan.id !== 'free';
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
                                    type="button"
                                    disabled
                                    aria-describedby={isPaidPlan ? `${plan.id}-demo-notice` : undefined}
                                    className={`w-full py-3 border-[3px] border-ink font-black uppercase tracking-wide text-sm btn-press ${isCurrentPlan
                                            ? 'bg-stone text-ink/40 cursor-default'
                                            : 'bg-stone text-ink/50 cursor-not-allowed'
                                        } disabled:opacity-50`}
                                >
                                    {isCurrentPlan ? (
                                        'Current Plan'
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                                {isPaidPlan && (
                                    <p id={`${plan.id}-demo-notice`} className="mt-2 text-center text-xs text-ink/50">
                                        Demonstration only — payments and premium features are not live.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center pb-8 px-6">
                    <p className="text-ink/50 text-xs">
                        Demonstration only. Prices are illustrative; payments are not available.
                    </p>
                </div>
            </div>
        </div>
    );
}
