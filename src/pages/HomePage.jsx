import React from 'react';
import { Info } from 'lucide-react';
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
    return (
        <div className="min-h-screen animated-gradient relative overflow-hidden font-sans text-center">
            {/* Header with Auth */}
            <Header />

            {/* Floating background particles */}
            <div className="particle particle-1 floating"></div>
            <div className="particle particle-2 floating-delayed"></div>
            <div className="particle particle-3 floating-slow"></div>
            <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gray-400/20 rounded-full blur-3xl floating"></div>
            <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-slate-400/20 rounded-full blur-3xl floating-delayed"></div>

            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

            {/* Main Content Wrapper */}
            <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start min-h-screen">
                <div className="max-w-6xl mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-14 animate-slide-down">
                        <div className="relative">
                            <h1 className="text-7xl sm:text-9xl lg:text-[12rem] font-black mb-6 relative leading-tight tracking-tight">
                                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent block drop-shadow-2xl">
                                    <span className="text-amber-50">Style /</span>
                                    <span className="text-orange-700">Me</span>
                                </span>
                            </h1>
                            {/* Help Button */}
                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="absolute top-4 right-4 sm:right-8 lg:right-16 p-3 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-full transition-all hover:scale-110 hover:shadow-xl border border-slate-600/50 group"
                                title="How to use Style/Me"
                            >
                                <Info className="w-6 h-6 group-hover:text-orange-400 transition-colors" />
                            </button>

                            {/* Usage Indicator */}
                            {subscriptionHook && (
                                <div className="absolute top-4 left-4 sm:left-8 lg:left-16">
                                    <UsageIndicator
                                        compact
                                        onClick={() => setShowUpgradeModal(true)}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-white/85 text-base sm:text-lg lg:text-2xl max-w-3xl mx-auto font-light tracking-wide mb-8 leading-relaxed">
                            AI-powered fashion feedback {weatherHook.useWeather && 'with real-time weather context'}, style preferences, and calendar integration.
                        </p>
                    </div>

                    {/* Weather Section */}
                    <WeatherSection {...weatherHook} />

                    {/* Mode Selector */}
                    <ModeSelector mode={mode} setMode={setMode} modes={modes} setRating={setRating} />

                    {/* Upload Section */}
                    <PhotoUpload
                        photo={photo}
                        photoPreview={photoPreview}
                        handleFileUpload={handleFileUpload}
                        clearPhoto={clearPhoto}
                        getRating={getRating}
                        loading={loading}
                        loadingMessage={loadingMessage}
                        currentMode={currentMode}
                    />

                    {/* Rating Display */}
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
                    />

                    {/* Footer */}
                    <div className="text-center mt-20 mb-10 animate-fade-in">
                        <p className="text-slate-300 text-sm sm:text-base mb-4 font-light tracking-wide drop-shadow-2xl">
                            Powered by <span className="font-semibold text-white">Claude Haiku 3.5</span> × Anthropic API {weatherHook.useWeather && '× OpenWeather'}
                        </p>
                        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase font-light">
                            #StyleMe
                        </p>
                    </div>
                </div>
            </div>

            {/* Help Modal */}
            <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />
        </div>
    );
};

export default HomePage;
