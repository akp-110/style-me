import React, { useRef } from 'react';
import { X, RefreshCw, Upload, Info } from 'lucide-react';

export const PhotoUpload = ({
    photoPreview,
    handleFileUpload,
    clearPhoto
}) => {
    const fileInputRef = useRef(null);

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Your fit</div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp,image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            {!photoPreview ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-[3px] border-dashed border-ink bg-white p-10 sm:p-16 text-center btn-press shadow-hard"
                >
                    <span className="inline-flex p-4 bg-acid border-[3px] border-ink mb-4">
                        <Upload className="w-8 h-8" />
                    </span>
                    <span className="block font-black uppercase tracking-wide text-lg">Drop a pic</span>
                    <span className="block text-sm text-ink/60 mt-1">Tap to choose a photo — JPG, PNG, HEIC</span>
                </button>
            ) : (
                <div className="relative animate-scale-in">
                    <img
                        src={photoPreview}
                        alt="Your outfit"
                        className="w-full max-h-[420px] sm:max-h-[560px] object-contain bg-stone border-[3px] border-ink shadow-hard"
                    />
                    <button
                        onClick={clearPhoto}
                        aria-label="Remove photo"
                        className="absolute top-2 right-2 chip-hard btn-press shadow-hard-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 left-2 chip-hard btn-press shadow-hard-sm"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Change
                    </button>
                </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-start gap-2 mt-3 text-ink/60">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                    <span className="font-bold text-ink/80">Privacy:</span> Photos are sent to Anthropic's Claude API for
                    analysis and never stored on our servers. See{' '}
                    <a
                        href="https://www.anthropic.com/legal/commercial-terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold hover:bg-acid"
                    >
                        Anthropic's privacy practices
                    </a>.
                </p>
            </div>
        </section>
    );
};
