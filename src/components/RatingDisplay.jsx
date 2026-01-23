import React, { useRef, useState } from 'react';
import { Wand2, Share2, Loader2, Bookmark, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { ShareCard } from './ShareCard';
import { OutfitAnalysisPanel } from './OutfitAnalysisPanel';
import { ProductRecommendations } from './ProductRecommendations';
import { useAuth } from '../context/AuthContext';
import { useOutfits } from '../hooks/useOutfits';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';
import { useProductSearch } from '../hooks/useProductSearch';

export const RatingDisplay = ({ rating, socialSummary, currentMode, mode, useWeather, weather, photoPreview, userPreferences = {} }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const shareCardRef = useRef(null);
    const { user } = useAuth();
    const { saveOutfit } = useOutfits();
    const { analysis, loading: analysisLoading, error: analysisError, analyzeOutfit } = useOutfitAnalysis();
    const { products, loading: productsLoading, error: productsError, searchQuery, searchProducts, clearProducts } = useProductSearch();

    if (!rating) return null;

    // Extract numeric rating
    const ratingMatch = rating.match(/Overall Rating:\s*(\d+(?:\.\d+)?)\/10/i);
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
                logging: true, // Enable logging for debugging
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

        // Extract base64 from data URL
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

    const handleSaveToWishlist = (product) => {
        // TODO: Phase 4 - Add to Supabase wishlist
        console.log('Save to wishlist:', product);
    };

    return (
        <div className="glass-strong rounded-[2.5rem] shadow-2xl p-10 sm:p-14 mb-10 border-2 border-white/40 backdrop-blur-xl animate-scale-in text-left relative">

            {/* Hidden Share Card for Generation - using opacity instead of positioning off-screen */}
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

            <div className="flex items-center gap-8 mb-12 pb-10 border-b-4 border-gradient-to-r from-slate-300 to-orange-300 relative">
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3 flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-orange-700" />
                            <span>{currentMode.label}'s Advice</span>
                        </h2>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Analyze Style Button */}
                            {photoPreview && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analysisLoading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${showAnalysis && analysis
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                                        }`}
                                    title="Get detailed color and style analysis"
                                >
                                    {analysisLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-5 h-5" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {analysisLoading ? 'Analyzing...' : 'Analyze Style'}
                                    </span>
                                </button>
                            )}

                            {/* Save Button - Only for logged in users */}
                            {user && photoPreview && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || isSaved}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 disabled:cursor-not-allowed ${isSaved
                                        ? 'bg-green-600 text-white'
                                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                                        }`}
                                    title={isSaved ? 'Saved!' : 'Save Outfit'}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : isSaved ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Bookmark className="w-5 h-5" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
                                    </span>
                                </button>
                            )}

                            {/* Share Button */}
                            {photoPreview && (
                                <button
                                    onClick={handleShare}
                                    disabled={isSharing}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Share Result"
                                >
                                    {isSharing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Share2 className="w-5 h-5" />
                                    )}
                                    <span className="hidden sm:inline">{isSharing ? 'Generating...' : 'Share'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                    </div>
                </div>
            </div>
            <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:text-gray-800 prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown
                    components={{
                        h2: (props) => (
                            <h2 className="text-4xl font-black text-gray-800 mt-10 mb-6 pb-3 border-b-4 border-gradient-to-r from-gray-200 to-slate-200" {...props} />
                        ),
                        h3: (props) => (
                            <h3 className="text-3xl font-bold text-gray-800 mt-8 mb-4" {...props} />
                        ),
                        p: (props) => (
                            <p className="mb-6 text-gray-700 leading-9 text-xl" {...props} />
                        ),
                        ul: (props) => (
                            <ul className="list-disc list-outside mb-8 space-y-4 ml-6 text-xl" {...props} />
                        ),
                        li: (props) => (
                            <li className="text-gray-700 leading-9 marker:text-slate-500 marker:font-bold" {...props} />
                        ),
                        strong: (props) => (
                            <strong className="font-black text-gray-900 bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1.5 rounded-lg shadow-sm" {...props} />
                        ),
                    }}
                >
                    {rating}
                </ReactMarkdown>
            </div>

            {/* Outfit Analysis Panel */}
            {showAnalysis && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200">
                    <OutfitAnalysisPanel
                        analysis={analysis}
                        loading={analysisLoading}
                        error={analysisError}
                        onSearchProduct={handleSearchProduct}
                    />
                </div>
            )}

            {/* Product Recommendations */}
            {(products.length > 0 || productsLoading) && (
                <div className="mt-8">
                    <ProductRecommendations
                        products={products}
                        loading={productsLoading}
                        error={productsError}
                        searchQuery={searchQuery}
                        onSaveToWishlist={handleSaveToWishlist}
                        onSearchMore={() => handleSearchProduct(searchQuery)}
                        onClose={clearProducts}
                    />
                </div>
            )}

            <div className="mt-12 p-8 bg-gradient-to-r from-slate-100/90 to-gray-100/90 rounded-3xl border-2 border-slate-200/60 backdrop-blur-sm shadow-xl">
                <p className="text-center text-gray-700 font-black text-lg flex items-center justify-center gap-3">
                    <span className="text-3xl">💡</span>
                    <span>
                        {useWeather && weather
                            ? 'Weather-aware rating provided! Try different modes for more perspectives!'
                            : 'Try different modes for completely different perspectives!'}
                    </span>
                </p>
            </div>
        </div>
    );
};
