import React from 'react';
import { Zap } from 'lucide-react';

export const ModeSelector = ({ mode, setMode, modes, setRating }) => {
    // Dynamic hover border classes based on mode
    const getHoverBorderClass = (key) => {
        const classes = {
            professional: 'hover:border-slate-600',
            balanced: 'hover:border-orange-700',
            hype: 'hover:border-green-700',
            roast: 'hover:border-indigo-700'
        };
        return classes[key] || 'hover:border-indigo-700';
    };

    return (
        <div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-10 mb-10 animate-slide-up border-2 border-white/40 backdrop-blur-xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-10 text-center flex items-center justify-center gap-4">
                <div className="p-2 bg-gradient-to-br from-slate-900 to-orange-950 rounded-xl">
                    <Zap className="w-7 h-7 text-amber-50" />
                </div>
                <span>Choose your advisor</span>
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
                {Object.entries(modes).map(([key, modeData]) => {
                    const { label, persona, bio, image, gradient, glow, dotColor } = modeData;
                    const hoverBorderClass = getHoverBorderClass(key);

                    return (
                        <button
                            key={key}
                            onClick={() => {
                                setMode(key);
                                setRating(null);
                            }}
                            className={`group relative p-4 sm:p-6 lg:p-10 rounded-[2rem] border-2 transition-all duration-500 transform hover:scale-[1.04] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-offset-2 ${mode === key
                                ? `bg-gradient-to-br ${gradient} text-white shadow-2xl ${glow} scale-[1.07] border-transparent`
                                : `border-slate-300/60 bg-white/90 hover:bg-white ${hoverBorderClass} text-slate-700 hover:shadow-xl`
                                }`}
                        >
                            {mode === key && (
                                <>
                                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce-slow z-20">
                                        <div className={`w-5 h-5 ${dotColor} rounded-full`}></div>
                                    </div>
                                    <div className="absolute inset-0 bg-white/30 rounded-[2rem] blur-2xl -z-10 animate-pulse-slow"></div>
                                </>
                            )}
                            {image && (
                                <div className={`mb-5 transition-all duration-500 persona-image-container ${mode === key
                                    ? 'scale-125 drop-shadow-2xl'
                                    : 'group-hover:scale-110'
                                    }`}>
                                    <div className="relative">
                                        {/* Glow background */}
                                        <div className={`persona-glow glow-${key === 'professional' ? 'slate' :
                                            key === 'balanced' ? 'orange' :
                                                key === 'hype' ? 'cyan' :
                                                    'slate'
                                            }`}></div>

                                        {/* Image */}
                                        <img
                                            src={image}
                                            alt={label}
                                            className="persona-image w-20 h-20 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border-4 relative z-10"
                                            style={{ borderColor: mode === key ? 'white' : 'currentColor' }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className={`mode-label font-semibold text-sm xs:text-base sm:text-lg text-center ${mode === key ? 'text-white drop-shadow-lg' : 'text-slate-800'
                                }`}>
                                {label}
                            </div>
                            <div className={`text-xs xs:text-sm sm:text-base text-center leading-tight mt-2 ${mode === key ? 'text-white/90' : 'text-slate-600'
                                }`}>
                                {persona}
                            </div>
                            {mode === key && (
                                <div className="text-xs sm:text-sm text-white/80 text-center mt-3 leading-snug px-2">
                                    {bio}
                                </div>
                            )}
                            {mode !== key && (
                                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-500/0 to-slate-500/0 group-hover:from-slate-500/10 group-hover:to-slate-500/10 transition-all duration-500"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
