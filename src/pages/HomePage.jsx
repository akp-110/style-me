import React from 'react';
import Header from '../components/Header';
import { WeatherSection } from '../components/WeatherSection';
import { ModeSelector } from '../components/ModeSelector';
import { PhotoUpload } from '../components/PhotoUpload';
import { RatingDisplay } from '../components/RatingDisplay';
import { HelpModal } from '../components/HelpModal';
import { UsageIndicator } from '../components/UsageIndicator';

export const HomePage = ({
    weatherHook,
    profileHook,
    subscriptionHook,
    setShowUpgradeModal,
    mode,
    setMode,
    modes,
    setRating,
    photo,
    photoPreview,
    handleFileUpload,
    clearPhoto,
    getRating,
    loading,
    loadingMessage,
    currentMode,
    rating,
    socialSummary,
    showHelpModal,
    setShowHelpModal
}) => {
    const showStickyRate = photo && !rating;

    return (
        <div className="min-h-screen bg-paper text-ink font-sans">
            {/* Top bar */}
            <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="font-black tracking-tight text-lg">STYLE/ME</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="chip-hard btn-press shadow-hard-sm"
                            title="How to use Style/Me"
                        >
                            ?
                        </button>
                        {subscriptionHook && (
                            <UsageIndicator compact onClick={() => setShowUpgradeModal(true)} />
                        )}
                        <Header />
                    </div>
                </div>
            </header>

            <main className={`max-w-3xl mx-auto px-4 ${showStickyRate ? 'pb-28' : 'pb-10'}`}>
                {rating ? (
                    <RatingDisplay
                        rating={rating}
                        socialSummary={socialSummary}
                        currentMode={currentMode}
                        mode={mode}
                        useWeather={weatherHook.useWeather}
                        weather={weatherHook.weather}
                        photoPreview={photoPreview}
                        userPreferences={{
                            favoriteBrands: profileHook.profile.favouriteBrands,
                            countryCode: profileHook.profile.countryCode
                        }}
                        onBack={() => setRating(null)}
                    />
                ) : (
                    <>
                        {/* Hero */}
                        <div className="pt-8 pb-6 text-left animate-fade-in">
                            <h1 className="font-black uppercase leading-[0.9] tracking-tight text-5xl sm:text-7xl">
                                Fit check<span className="text-acid-dim">.</span>
                            </h1>
                            <p className="mt-3 text-sm sm:text-base text-ink/60 max-w-md">
                                Four advisors. One photo. Zero mercy.
                                {weatherHook.useWeather && ' Weather included.'}
                            </p>
                        </div>

                        <WeatherSection {...weatherHook} />

                        <ModeSelector mode={mode} setMode={setMode} modes={modes} setRating={setRating} />

                        <PhotoUpload
                            photoPreview={photoPreview}
                            handleFileUpload={handleFileUpload}
                            clearPhoto={clearPhoto}
                        />
                    </>
                )}

                {/* Footer */}
                {!rating && (
                    <div className="text-center mt-16 space-y-1">
                        <p className="label-caps text-ink/40">Powered by Claude Haiku 4.5 × Anthropic</p>
                        <p className="label-caps text-ink/30">#StyleMe</p>
                    </div>
                )}
            </main>

            {/* Sticky rate CTA */}
            {showStickyRate && (
                <div className="fixed bottom-0 inset-x-0 z-40 border-t-[3px] border-ink bg-paper p-3">
                    <button
                        onClick={getRating}
                        disabled={loading}
                        className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-base py-3.5"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
                                {loadingMessage}
                            </>
                        ) : (
                            'Rate me →'
                        )}
                    </button>
                </div>
            )}

            <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />
        </div>
    );
};

export default HomePage;
