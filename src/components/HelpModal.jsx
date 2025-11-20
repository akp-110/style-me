import React from 'react';
import { X, Upload, User, Calendar, Heart, Sparkles } from 'lucide-react';

export function HelpModal({ showHelpModal, setShowHelpModal }) {
    if (!showHelpModal) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700/50 animate-scale-in">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-orange-400" />
                            How to Use Style/Me
                        </h2>
                        <p className="text-slate-300 text-sm">Get AI-powered fashion feedback in 4 easy steps</p>
                    </div>
                    <button
                        onClick={() => setShowHelpModal(false)}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl">
                                <Upload className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">1. Upload Your Outfit Photo</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Click the upload area or drag and drop a photo of your outfit. Make sure the photo is clear and shows your full outfit for the best feedback.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl">
                                <User className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">2. Choose Your Style Advisor</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                    Select one of four unique fashion experts, each with their own perspective:
                                </p>
                                <ul className="text-slate-300 text-sm space-y-2 ml-4">
                                    <li><strong className="text-slate-200">Alexandra Ashford</strong> - Sophisticated, analytical feedback</li>
                                    <li><strong className="text-orange-300">Margot Leclerc</strong> - Warm, elegant guidance (Balanced)</li>
                                    <li><strong className="text-green-300">Kai Chen</strong> - Enthusiastic, confidence-boosting</li>
                                    <li><strong className="text-indigo-300">Marcus Stone</strong> - Witty, honest critique</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl">
                                <Heart className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">3. Personalize (Optional)</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                    Enhance your feedback by adding context:
                                </p>
                                <ul className="text-slate-300 text-sm space-y-2 ml-4">
                                    <li><strong className="text-slate-200">Style Profile</strong> - Add your favorite styles, colors, and brands</li>
                                    <li><strong className="text-slate-200">Calendar</strong> - Add upcoming events for occasion-specific advice</li>
                                    <li><strong className="text-slate-200">Weather</strong> - Enable to get weather-appropriate suggestions</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl">
                                <Sparkles className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">4. Get Your Rating</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Click "Rate My Outfit" and receive detailed feedback including an overall rating, style breakdown, what works, and personalized suggestions for improvement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-2xl p-6 border border-orange-500/30">
                    <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Pro Tips
                    </h3>
                    <ul className="text-slate-300 text-sm space-y-2">
                        <li>• Take photos in good lighting for more accurate feedback</li>
                        <li>• Try different advisors to get varied perspectives on the same outfit</li>
                        <li>• Update your style profile as your preferences evolve</li>
                        <li>• Add calendar events to get outfit suggestions for specific occasions</li>
                    </ul>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setShowHelpModal(false)}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
}
