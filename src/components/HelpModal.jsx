import React from 'react';
import { X, Upload, User, Heart, Sparkles } from 'lucide-react';

export function HelpModal({ showHelpModal, setShowHelpModal }) {
    if (!showHelpModal) return null;

    return (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-paper p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-[3px] border-ink shadow-hard-lg animate-scale-in">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-1 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            How to Use Style/Me
                        </h2>
                        <p className="text-ink/60 text-sm">Get AI-powered fashion feedback in 4 easy steps</p>
                    </div>
                    <button
                        onClick={() => setShowHelpModal(false)}
                        className="chip-hard btn-press shadow-hard-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="card-hard p-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-acid border-2 border-ink p-2">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="label-caps mb-2">1. Upload Your Outfit Photo</h3>
                                <p className="text-ink/70 text-sm leading-relaxed">
                                    Click the upload area or drag and drop a photo of your outfit. Make sure the photo is clear and shows your full outfit for the best feedback.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="card-hard p-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-acid border-2 border-ink p-2">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="label-caps mb-2">2. Choose Your Style Advisor</h3>
                                <p className="text-ink/70 text-sm leading-relaxed mb-3">
                                    Select one of four unique fashion experts, each with their own perspective:
                                </p>
                                <ul className="text-ink/70 text-sm space-y-2 ml-4">
                                    <li><strong className="text-ink">Alexandra Ashford</strong> - Sophisticated, analytical feedback</li>
                                    <li><strong className="text-ink">Margot Leclerc</strong> - Warm, elegant guidance (Balanced)</li>
                                    <li><strong className="text-ink">Kai Chen</strong> - Enthusiastic, confidence-boosting</li>
                                    <li><strong className="text-ink">Marcus Stone</strong> - Witty, honest critique</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="card-hard p-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-acid border-2 border-ink p-2">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="label-caps mb-2">3. Personalize (Optional)</h3>
                                <p className="text-ink/70 text-sm leading-relaxed mb-3">
                                    Enhance your feedback by adding context:
                                </p>
                                <ul className="text-ink/70 text-sm space-y-2 ml-4">
                                    <li><strong className="text-ink">Style Profile</strong> - Add your favorite styles, colors, and brands</li>
                                    <li><strong className="text-ink">Calendar</strong> - Add upcoming events for occasion-specific advice</li>
                                    <li><strong className="text-ink">Weather</strong> - Enable to get weather-appropriate suggestions</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="card-hard p-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-acid border-2 border-ink p-2">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="label-caps mb-2">4. Get Your Rating</h3>
                                <p className="text-ink/70 text-sm leading-relaxed">
                                    Click "Rate My Outfit" and receive detailed feedback including an overall rating, style breakdown, what works, and personalized suggestions for improvement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 card-hard p-4">
                    <h3 className="label-caps mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Pro Tips
                    </h3>
                    <ul className="text-ink/70 text-sm space-y-2">
                        <li>• Take photos in good lighting for more accurate feedback</li>
                        <li>• Try different advisors to get varied perspectives on the same outfit</li>
                        <li>• Update your style profile as your preferences evolve</li>
                        <li>• Add calendar events to get outfit suggestions for specific occasions</li>
                    </ul>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setShowHelpModal(false)}
                    className="mt-6 w-full py-3 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
}
