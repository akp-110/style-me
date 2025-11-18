import React from 'react';
import { X, Heart, Settings, Plus, Palette, Award, Lightbulb } from 'lucide-react';

export const StyleProfileModal = ({
    showStyleModal,
    setShowStyleModal,
    styleProfile,
    newPref,
    setNewPref,
    newColor,
    setNewColor,
    newBrand,
    setNewBrand,
    addPreference,
    addColor,
    addBrand,
    removeItem
}) => {
    if (!showStyleModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-orange-800 px-6 sm:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-white" fill="white" />
                        <h2 className="text-2xl sm:text-3xl font-black text-white">My Style Profile</h2>
                    </div>
                    <button
                        onClick={() => setShowStyleModal(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Style Preferences */}
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Settings className="w-6 h-6" />
                            Style Preferences
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">Add words that describe your style (e.g., minimalist, boho, edgy, preppy)</p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newPref}
                                onChange={(e) => setNewPref(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPreference()}
                                placeholder="e.g., minimalist"
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-orange-600 focus:outline-none font-medium text-slate-800"
                            />
                            <button
                                onClick={addPreference}
                                className="px-4 py-2 bg-orange-600 text-amber-50 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {styleProfile.preferences.map((pref, idx) => (
                                <div key={idx} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                                    <span>{pref}</span>
                                    <button
                                        onClick={() => removeItem('preferences', idx)}
                                        className="hover:bg-orange-200 rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favourite Colors */}
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Palette className="w-6 h-6" />
                            Favourite Colours
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">Add your favourite colours</p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addColor()}
                                placeholder="e.g., navy blue"
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none font-medium text-slate-800"
                            />
                            <button
                                onClick={addColor}
                                className="px-4 py-2 bg-slate-700 text-amber-50 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {styleProfile.colors.map((color, idx) => (
                                <div key={idx} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                                    <span>{color}</span>
                                    <button
                                        onClick={() => removeItem('colors', idx)}
                                        className="hover:bg-slate-200 rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favourite Brands */}
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Award className="w-6 h-6" />
                            Favourite Brands
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">Add your favourite clothing brands</p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newBrand}
                                onChange={(e) => setNewBrand(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addBrand()}
                                placeholder="e.g., Zara"
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none font-medium text-slate-800"
                            />
                            <button
                                onClick={addBrand}
                                className="px-4 py-2 bg-slate-600 text-amber-50 rounded-xl font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {styleProfile.brands.map((brand, idx) => (
                                <div key={idx} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                                    <span>{brand}</span>
                                    <button
                                        onClick={() => removeItem('brands', idx)}
                                        className="hover:bg-slate-200 rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info section */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                        <p className="text-sm text-orange-900 font-semibold flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            <span><span className="font-black">Tip:</span> Your style profile is saved locally on your device and will be used to personalise outfit suggestions and recommendations!</span>
                        </p>
                    </div>

                    <button
                        onClick={() => setShowStyleModal(false)}
                        className="w-full py-3 bg-gradient-to-r from-slate-700 to-orange-700 text-white rounded-2xl font-semibold text-lg hover:shadow-lg transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
