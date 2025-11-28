import React, { useRef, useState } from 'react';
import { Share2, Download, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { ShareCard } from './ShareCard';

export const RatingDisplay = ({ rating, socialSummary, currentMode, mode, useWeather, weather, photoPreview, onViewPhoto, onRateAnother }) => {
    const [isSharing, setIsSharing] = useState(false);
    const shareCardRef = useRef(null);

    if (!rating) return null;

    // Extract numeric rating
    const ratingMatch = rating.match(/Overall Rating:\s*(\d+(?:\.\d+)??)\/10/i) || rating.match(/Rating:\s*(\d+(?:\.\d+)??)\/10/i);
    const numericRating = ratingMatch ? ratingMatch[1] : '?';

    const handleShare = async () => {
        if (!shareCardRef.current) {
            console.error('Share card ref not found');
            alert('Share card not ready. Please try again.');
            return;
        }

        setIsSharing(true);
        try {
            // Wait a moment for the card to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 300));

            console.log('Generating canvas from share card...');
            const canvas = await html2canvas(shareCardRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true,
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0
            });

            console.log('Canvas generated, creating blob...');
            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            if (!imageBlob) {
                throw new Error('Failed to create image blob');
            }

            const file = new File([imageBlob], 'style-me-rating.png', { type: 'image/png' });

            console.log('Attempting to share...');
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Style/Me Rating',
                    text: `I got a ${numericRating}/10 from ${currentMode.label}! #StyleMe`,
                    files: [file]
                });
                console.log('Shared successfully via Web Share API');
            } else {
                // Fallback to download
                console.log('Web Share API not available, downloading instead...');
                const link = document.createElement('a');
                link.download = 'style-me-rating.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                console.log('Download initiated');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert(`Failed to generate share image: ${error.message}\n\nCheck the browser console for more details.`);
        } finally {
            setIsSharing(false);
        }
    };

    // Check if content is still streaming (very short or incomplete)
    const isStreaming = rating.length < 50;

    return (
        <>
            {/* Hidden Share Card for Generation */}
            <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
                <ShareCard
                    ref={shareCardRef}
                    photoPreview={photoPreview}
                    advisorName={currentMode.label}
                    advisorPersona={currentMode.persona}
                    summary={socialSummary || `Rated ${numericRating}/10 by ${currentMode.label}`}
                    rating={numericRating}
                    mode={mode}
                />
            </div>

            {/* Single Compact Advice Card */}
            <div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-12 mb-10 border-2 border-white/40 backdrop-blur-xl animate-scale-in text-left relative overflow-hidden">

                {/* Streaming indicator glow */}
                {isStreaming && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none"></div>
                )}

                {/* Header with Rating & Share */}
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-8 pb-6 border-b-2 border-white/20 gap-4">
                    <div className="flex-1">
                        {/* Large Rating Display */}
                        <div className="flex items-baseline gap-4 mb-3">
                            <span className="text-7xl sm:text-8xl font-black bg-gradient-to-br from-slate-800 via-slate-900 to-black bg-clip-text text-transparent drop-shadow-lg">
                                {numericRating}
                            </span>
                            <span className="text-3xl sm:text-4xl font-bold text-slate-600">/10</span>
                        </div>

                        {/* Advisor Info */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className={`w-3 h-3 rounded-full ${currentMode.dotColor} ring-2 ring-white/50 shadow-md`}></div>
                            <p className="text-slate-700 font-semibold text-lg">
                                {currentMode.label}
                            </p>
                            <span className="text-slate-500 text-sm italic">
                                {currentMode.persona}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                        {/* View Photo Button */}
                        <button
                            onClick={onViewPhoto}
                            className="px-3 sm:px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all font-medium text-xs sm:text-sm"
                        >
                            View Photo
                        </button>

                        {/* Rate Another Button */}
                        <button
                            onClick={onRateAnother}
                            className="px-3 sm:px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all font-medium text-xs sm:text-sm"
                        >
                            Rate Another
                        </button>

                        {photoPreview && !isStreaming && (
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-sm"
                                title="Share Result"
                            >
                                {isSharing ? (
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : (
                                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                                <span className="font-semibold">{isSharing ? 'Generating...' : 'Share'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Advice Content - Optimized for concise format */}
                <div className="prose prose-lg sm:prose-xl max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: (props) => (
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-6 mb-4 flex items-center gap-2" {...props}>
                                    <Sparkles className="w-6 h-6 text-orange-600" />
                                    {props.children}
                                </h2>
                            ),
                            h3: (props) => (
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-5 mb-3" {...props} />
                            ),
                            p: (props) => (
                                <p className="mb-4 text-slate-700 leading-relaxed text-lg" {...props} />
                            ),
                            strong: (props) => (
                                <strong className="font-black text-slate-900 bg-gradient-to-r from-orange-50 to-slate-50 px-2 py-0.5 rounded" {...props} />
                            ),
                            ul: (props) => (
                                <ul className="mb-4 text-slate-700 leading-relaxed text-lg list-disc list-inside" {...props} />
                            ),
                            ol: (props) => (
                                <ol className="mb-4 text-slate-700 leading-relaxed text-lg list-decimal list-inside" {...props} />
                            ),
                            li: (props) => (
                                <li className="mb-2 text-slate-700 text-lg" {...props} />
                            ),
                        }}
                    >
                        {rating}
                    </ReactMarkdown>
                </div>

                {/* Streaming cursor effect */}
                {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-slate-800 animate-pulse ml-1"></span>
                )}
            </div>
        </>
    );
};
