import React, { useRef } from 'react';
import { X, RefreshCw, Upload, Sparkles, Info } from 'lucide-react';

export const PhotoUpload = ({
    photo,
    photoPreview,
    handleFileUpload,
    clearPhoto,
    getRating,
    loading,
    loadingMessage,
    currentMode
}) => {
    const fileInputRef = useRef(null);

    return (
        <>
            <div className="glass-strong rounded-[2.5rem] shadow-2xl p-6 sm:p-10 mb-4 animate-slide-up border-2 border-white/40 backdrop-blur-xl text-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {!photoPreview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-4 border-dashed border-white/50 rounded-[2rem] p-12 sm:p-24 text-center cursor-pointer hover:border-white/80 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-10">
                                <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 backdrop-blur-md shadow-md border-2 border-white/30">
                                    <Upload className="w-20 h-20 sm:w-24 sm:h-24 text-white mx-auto drop-shadow-lg" />
                                </div>
                            </div>
                            <p className="text-3xl sm:text-4xl font-black text-slate-900 sm:text-white mb-4 drop-shadow-2xl">
                                Upload Your Outfit Photo
                            </p>
                            <p className="text-slate-900 sm:text-white/90 text-lg sm:text-xl mb-3 font-medium">
                                Click to select or drag & drop an image
                            </p>
                            <p className="text-slate-700 sm:text-white/70 text-sm sm:text-base">
                                Supports JPG, PNG, HEIC, and other image formats
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-scale-in">
                        <div className="relative group">
                            <div className="absolute -inset-6 bg-gradient-to-br from-slate-900/40 to-orange-950/40 rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-[2rem]"></div>
                                <img
                                    src={photoPreview}
                                    alt="Your outfit"
                                    className="w-full max-h-[360px] sm:max-h-[700px] object-contain rounded-[2rem] shadow-md sm:shadow-2xl border-4 border-white/60 backdrop-blur-sm"
                                />
                                <button
                                    onClick={clearPhoto}
                                    className="absolute top-3 right-3 p-4 btn-soft rounded-2xl shadow-md hover:scale-110 hover:rotate-90 transition-all duration-300 border border-white/10"
                                    aria-label="Remove photo"
                                >
                                    <X className="w-6 h-6 text-slate-800" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-3 px-6 sm:py-6 sm:px-10 btn-soft font-semibold text-lg sm:text-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border border-transparent hover:border-orange-600 shadow-md"
                            >
                                <RefreshCw className="text-slate-800 w-7 h-7" />
                                <span className="text-black">Change Photo</span>
                            </button>
                            <button
                                onClick={getRating}
                                disabled={loading}
                                className={`flex-1 py-3 px-6 sm:py-6 sm:px-10 bg-gradient-to-r ${currentMode.gradient} text-white rounded-2xl font-semibold text-xl sm:text-2xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 transform hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 disabled:hover:scale-100 disabled:hover:translate-y-0 ${currentMode.glow} border-2 border-white/40 shadow-2xl`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                                        <span>{loadingMessage}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-8 h-8" />
                                        <span>Rate My Outfit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 mb-10 px-4 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Info className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80 leading-relaxed text-left">
                    <span className="font-semibold text-white">Privacy:</span> Your photos are processed securely in your browser, sent to Anthropic&apos;s Claude API for AI analysis, and are not permanently stored on our servers. Images are only held temporarily in memory during processing. Learn more about{' '}
                    <a
                        href="https://www.anthropic.com/legal/commercial-terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-semibold underline hover:text-orange-300 transition-colors"
                    >
                        Anthropic&apos;s privacy practices
                    </a>.
                </p>
            </div>
        </>
    );
};
