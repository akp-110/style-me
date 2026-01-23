import React from 'react';
import { Palette, Check, AlertCircle } from 'lucide-react';

/**
 * Displays the extracted color palette from outfit analysis
 */
export const ColorPalette = ({ colors }) => {
    if (!colors) return null;

    const { primary, secondary, accent, neutrals = [], palette_type } = colors;

    // Color harmony descriptions
    const harmonyDescriptions = {
        'monochromatic': 'Single hue with varying shades - elegant and cohesive',
        'analogous': 'Adjacent colors on the wheel - harmonious and calm',
        'complementary': 'Opposite colors - bold and dynamic contrast',
        'triadic': 'Three evenly spaced colors - vibrant and balanced',
        'split-complementary': 'One color + two adjacent to its complement - nuanced contrast'
    };

    const ColorSwatch = ({ color, label, size = 'md' }) => {
        const sizes = {
            sm: 'w-8 h-8',
            md: 'w-12 h-12',
            lg: 'w-16 h-16'
        };

        return (
            <div className="flex flex-col items-center gap-1">
                <div
                    className={`${sizes[size]} rounded-xl shadow-lg border-2 border-white/30 transition-transform hover:scale-110 cursor-pointer`}
                    style={{ backgroundColor: color }}
                    title={color}
                />
                {label && (
                    <span className="text-xs text-slate-600 font-medium">{label}</span>
                )}
                <span className="text-xs text-slate-400 font-mono">{color}</span>
            </div>
        );
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/40">
            <div className="flex items-center gap-3 mb-4">
                <Palette className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-slate-800">Color Palette</h3>
            </div>

            {/* Palette Type Badge */}
            {palette_type && (
                <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full text-sm font-medium text-slate-700 border border-slate-200">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        {palette_type.charAt(0).toUpperCase() + palette_type.slice(1).replace('-', ' ')}
                    </span>
                    <p className="text-xs text-slate-500 mt-2 italic">
                        {harmonyDescriptions[palette_type] || 'Custom color combination'}
                    </p>
                </div>
            )}

            {/* Main Colors */}
            <div className="flex flex-wrap gap-4 mb-4">
                {primary && <ColorSwatch color={primary} label="Primary" size="lg" />}
                {secondary && <ColorSwatch color={secondary} label="Secondary" size="md" />}
                {accent && <ColorSwatch color={accent} label="Accent" size="md" />}
            </div>

            {/* Neutrals */}
            {neutrals.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-medium mb-2 block">Neutrals</span>
                    <div className="flex gap-2">
                        {neutrals.map((color, idx) => (
                            <ColorSwatch key={idx} color={color} size="sm" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Displays style analysis scores and tags
 */
export const StyleAnalysis = ({ analysis }) => {
    if (!analysis) return null;

    const { current_aesthetic, proportion_score, color_harmony_score, occasion_versatility = [] } = analysis;

    const ScoreBar = ({ label, score, color = 'orange' }) => (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-bold text-slate-800">{score}/10</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `${score * 10}%`, backgroundColor: color === 'orange' ? '#f97316' : '#10b981' }}
                />
            </div>
        </div>
    );

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/40">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Style Analysis</h3>

            {/* Current Aesthetic */}
            {current_aesthetic && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-slate-50 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Current Aesthetic</span>
                    <span className="text-lg font-bold text-slate-800">{current_aesthetic}</span>
                </div>
            )}

            {/* Scores */}
            <ScoreBar label="Proportion" score={proportion_score} color="orange" />
            <ScoreBar label="Color Harmony" score={color_harmony_score} color="emerald" />

            {/* Occasion Versatility */}
            {occasion_versatility.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-medium mb-2 block">Works For</span>
                    <div className="flex flex-wrap gap-2">
                        {occasion_versatility.map((occasion, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                            >
                                <Check className="w-3 h-3" />
                                {occasion}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Displays improvement suggestions with search terms
 */
export const ImprovementGaps = ({ gaps, onSearchProduct }) => {
    if (!gaps || gaps.length === 0) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/40">
            <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-slate-800">Style Upgrades</h3>
            </div>

            <div className="space-y-4">
                {gaps.map((gap, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <span className="inline-block px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded uppercase mb-2">
                                    {gap.category}
                                </span>
                                <p className="text-slate-700 font-medium mb-1">{gap.issue}</p>
                                <p className="text-slate-600 text-sm">{gap.suggestion}</p>
                            </div>
                            {gap.search_terms && gap.search_terms.length > 0 && onSearchProduct && (
                                <button
                                    onClick={() => onSearchProduct(gap.search_terms[0])}
                                    className="flex-shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
                                >
                                    Find Items
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Main outfit analysis display component
 */
export const OutfitAnalysisPanel = ({ analysis, loading, error, onSearchProduct }) => {
    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/40 text-center">
                <div className="animate-spin w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Analyzing colors and style...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <p className="text-red-700 font-medium">Analysis failed: {error}</p>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Color Palette */}
            <ColorPalette colors={analysis.colors} />

            {/* Style Analysis */}
            <StyleAnalysis analysis={analysis.style_analysis} />

            {/* Color Theory Notes */}
            {analysis.color_theory_notes && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-2">💡 Color Theory Insight</h4>
                    <p className="text-indigo-700">{analysis.color_theory_notes}</p>
                </div>
            )}

            {/* Improvement Gaps */}
            <ImprovementGaps gaps={analysis.improvement_gaps} onSearchProduct={onSearchProduct} />
        </div>
    );
};

export default OutfitAnalysisPanel;
