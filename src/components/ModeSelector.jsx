import React from 'react';

export const ModeSelector = ({ mode, setMode, modes, setRating }) => {
    const entries = Object.entries(modes);
    const selectedIndex = entries.findIndex(([key]) => key === mode);
    const current = modes[mode];

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Pick your advisor</div>

            {/* Avatar row */}
            <div className="flex gap-3" role="radiogroup" aria-label="Choose your advisor">
                {entries.map(([key, m]) => {
                    const selected = mode === key;
                    return (
                        <button
                            key={key}
                            role="radio"
                            aria-checked={selected}
                            title={m.label}
                            onClick={() => { setMode(key); setRating(null); }}
                            className={`relative w-14 h-14 rounded-full border-2 border-ink btn-press flex-shrink-0 ${
                                selected ? 'shadow-hard ring-4 ring-acid' : 'shadow-hard-sm'
                            }`}
                        >
                            <img
                                src={m.image}
                                alt={m.label}
                                className="w-full h-full rounded-full object-cover grayscale contrast-125"
                            />
                            {selected && (
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-ink text-acid rounded-full text-[10px] font-black flex items-center justify-center border border-acid">
                                    ✓
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Advisor detail card */}
            <div className="card-hard mt-4 p-4" key={mode}>
                <div className="flex justify-between items-baseline gap-2">
                    <div className="font-serif italic text-xl">{current.label}</div>
                    <div className="label-caps text-ink/40">
                        {String(selectedIndex + 1).padStart(2, '0')}/{String(entries.length).padStart(2, '0')}
                    </div>
                </div>
                <div className="label-caps text-ink/50 mt-1">{current.title}</div>
                <p className="font-serif text-sm leading-relaxed mt-2 text-ink/80">"{current.quote}"</p>
            </div>
        </section>
    );
};
