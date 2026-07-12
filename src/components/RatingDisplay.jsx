import React, { useRef, useState, useMemo } from 'react';
import { ArrowLeft, Share2, Loader2, Bookmark, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { OutfitAnalysisPanel } from './OutfitAnalysisPanel';
import { ProductRecommendations } from './ProductRecommendations';
import { useAuth } from '../context/AuthContext';
import { useOutfits } from '../hooks/useOutfits';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';
import { useProductSearch } from '../hooks/useProductSearch';
import { parseRating } from '../utils/parseRating';

const proseComponents = {
    p: (props) => <p className="text-sm leading-relaxed text-ink/80 mb-2 last:mb-0" {...props} />,
    ul: (props) => <ul className="space-y-1.5 mb-2 last:mb-0" {...props} />,
    li: (props) => <li className="text-sm leading-relaxed text-ink/80 flex gap-2"><span aria-hidden="true">→</span><span {...props} /></li>,
    strong: (props) => <strong className="font-bold text-ink" {...props} />,
    h2: (props) => <h2 className="label-caps mt-4 mb-2" {...props} />,
    h3: (props) => <h3 className="label-caps mt-4 mb-2" {...props} />,
};

const worksComponents = {
    ...proseComponents,
    li: (props) => <li className="text-sm leading-relaxed text-ink/80 flex gap-2"><span aria-hidden="true">✓</span><span {...props} /></li>,
};

export const RatingDisplay = ({ rating, socialSummary, currentMode, mode, useWeather, weather, photoPreview, userPreferences = {}, onBack }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const polaroidRef = useRef(null);
    const { user } = useAuth();
    const { saveOutfit } = useOutfits();
    const { analysis, loading: analysisLoading, error: analysisError, analyzeOutfit } = useOutfitAnalysis();
    const { products, loading: productsLoading, error: productsError, searchQuery, searchProducts, clearProducts } = useProductSearch();

    const parsed = useMemo(() => parseRating(rating), [rating]);

    if (!rating) return null;

    const numericRating = parsed.overall ?? '?';

    const handleShare = async () => {
        if (!polaroidRef.current) return;
        setIsSharing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const canvas = await html2canvas(polaroidRef.current, {
                scale: 2,
                backgroundColor: '#FAF7F2',
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0
            });
            const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (!imageBlob) throw new Error('Failed to create image blob');
            const file = new File([imageBlob], 'style-me-rating.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Style/Me Rating',
                    text: `I got a ${numericRating}/10 from ${currentMode.label}! #StyleMe`,
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'style-me-rating.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert(`Failed to generate share image: ${error.message}`);
        } finally {
            setIsSharing(false);
        }
    };

    const handleSave = async () => {
        if (!user || !photoPreview) return;
        setIsSaving(true);
        try {
            await saveOutfit({
                photoDataUrl: photoPreview,
                ratingText: rating,
                socialSummary: socialSummary,
                advisorMode: mode,
                numericRating: parseFloat(numericRating) || 0
            });
            setIsSaved(true);
        } catch (error) {
            console.error('Error saving outfit:', error);
            alert(`Failed to save outfit: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnalyze = async () => {
        if (!photoPreview) return;
        setShowAnalysis(true);
        const base64 = photoPreview.split(',')[1];
        await analyzeOutfit(base64, 'image/jpeg', userPreferences);
    };

    const handleSearchProduct = (query) => {
        searchProducts(query, {
            stores: userPreferences?.favoriteBrands || ['H&M', 'ASOS', 'Amazon'],
            country: userPreferences?.countryCode || 'US',
            limit: 8
        });
    };

    return (
        <div className="pb-24 animate-fade-in text-left">
            {/* Verdict header */}
            <div className="flex items-center justify-between pt-6 pb-4">
                {onBack ? (
                    <button onClick={onBack} className="chip-hard btn-press shadow-hard-sm">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                ) : <span />}
                <span className="font-black uppercase tracking-tight text-lg">The verdict</span>
                <span className="w-16" aria-hidden="true" />
            </div>

            {/* Polaroid (share card) — inline hex styles only; html2canvas can't parse oklch */}
            {photoPreview && (
                <div className="mx-auto max-w-sm -rotate-[1.5deg] my-4">
                    <div
                        ref={polaroidRef}
                        style={{
                            background: '#ffffff',
                            border: '3px solid #111111',
                            boxShadow: '5px 5px 0 0 #111111',
                            padding: '12px 12px 16px',
                            fontFamily: "'Archivo', sans-serif",
                            color: '#111111'
                        }}
                    >
                        <div style={{ position: 'relative', border: '2px solid #111111', background: '#DDD8CF' }}>
                            <img
                                src={photoPreview}
                                alt="Rated outfit"
                                crossOrigin="anonymous"
                                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute', top: '-10px', right: '-10px',
                                background: '#D7FD35', border: '3px solid #111111',
                                padding: '4px 10px', transform: 'rotate(6deg)'
                            }}>
                                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700 }}>{numericRating}</span>
                                <span style={{ fontSize: '11px', fontWeight: 800 }}>/10</span>
                            </div>
                        </div>
                        <p style={{
                            fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                            textAlign: 'center', margin: '14px 8px 6px', fontSize: '15px', lineHeight: 1.5
                        }}>
                            "{socialSummary || `Rated ${numericRating}/10 by ${currentMode.label}`}"
                        </p>
                        <p style={{
                            textAlign: 'center', fontSize: '9px', fontWeight: 800,
                            letterSpacing: '0.14em', color: '#777777', textTransform: 'uppercase'
                        }}>
                            — {currentMode.label}, {currentMode.title} · #StyleMe
                        </p>
                    </div>
                </div>
            )}

            {/* Breakdown bars */}
            {parsed.breakdown.length > 0 && (
                <section className="card-hard p-4 mt-6">
                    <div className="label-caps mb-3">The breakdown</div>
                    {parsed.breakdown.map(({ label, score }) => (
                        <div key={label} className="mb-3 last:mb-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="label-caps">{label}</span>
                                <span className="font-serif">{score}/10</span>
                            </div>
                            <div className="h-3.5 border-2 border-ink bg-white">
                                <div
                                    className="h-full bg-acid border-r-2 border-ink"
                                    style={{ width: `${Math.min(100, score * 10)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* What works */}
            {parsed.whatWorks && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block">What works</span>
                    <div className="mt-3">
                        <ReactMarkdown components={worksComponents}>{parsed.whatWorks}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Suggestions */}
            {parsed.suggestions && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-ink text-acid border-2 border-ink px-1.5 py-0.5 inline-block">Level it up</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{parsed.suggestions}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Extra sections (Weather Check, Calendar Compatibility, The Roast, …) */}
            {parsed.extras.map(({ title, body }) => (
                <section key={title} className="card-hard p-4 mt-4">
                    <span className="label-caps bg-stone border-2 border-ink px-1.5 py-0.5 inline-block">{title}</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{body}</ReactMarkdown>
                    </div>
                </section>
            ))}

            {/* Full-prose fallback when the template didn't parse */}
            {!parsed.parsed && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block">{currentMode.label}'s advice</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{rating}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Analyze chip */}
            {photoPreview && (
                <div className="mt-4">
                    <button onClick={handleAnalyze} disabled={analysisLoading} className="chip-hard btn-press shadow-hard-sm">
                        {analysisLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {analysisLoading ? 'Analyzing…' : 'Analyze colors & style'}
                    </button>
                </div>
            )}

            {showAnalysis && (
                <div className="mt-4">
                    <OutfitAnalysisPanel
                        analysis={analysis}
                        loading={analysisLoading}
                        error={analysisError}
                        onSearchProduct={handleSearchProduct}
                    />
                </div>
            )}

            {(products.length > 0 || productsLoading) && (
                <div className="mt-4">
                    <ProductRecommendations
                        products={products}
                        loading={productsLoading}
                        error={productsError}
                        searchQuery={searchQuery}
                        onSaveToWishlist={(product) => console.log('Save to wishlist:', product)}
                        onSearchMore={() => handleSearchProduct(searchQuery)}
                        onClose={clearProducts}
                    />
                </div>
            )}

            <p className="label-caps text-ink/40 text-center mt-8">
                {useWeather && weather ? 'Weather-aware verdict · ' : ''}Try another advisor for a different take
            </p>

            {/* Sticky actions */}
            <div className="fixed bottom-0 inset-x-0 z-40 border-t-[3px] border-ink bg-paper p-3">
                <div className="max-w-xl mx-auto flex gap-2">
                    {user && photoPreview && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSaved}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-sm py-3"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            {isSaving ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex-[1.6] flex items-center justify-center gap-2 bg-ink text-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-sm py-3"
                    >
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {isSharing ? 'Generating…' : 'Share card ↗'}
                    </button>
                </div>
            </div>
        </div>
    );
};
