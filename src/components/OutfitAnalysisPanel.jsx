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
                    className={`${sizes[size]} border-2 border-ink shadow-hard-sm`}
                    style={{ backgroundColor: color }}
                    title={color}
                />
                {label && (
                    <span className="text-xs text-ink/70 font-medium">{label}</span>
                )}
                <span className="text-xs text-ink/50 font-mono">{color}</span>
            </div>
        );
    };

    return (
        <div className="card-hard p-4">
            <div className="flex items-center gap-3 mb-4">
                <Palette className="w-4 h-4" />
                <h3 className="label-caps">Color Palette</h3>
            </div>

            {/* Palette Type Badge */}
            {palette_type && (
                <div className="mb-4">
                    <span className="chip-hard">
                        <span className="w-2 h-2 bg-acid border border-ink" />
                        {palette_type.charAt(0).toUpperCase() + palette_type.slice(1).replace('-', ' ')}
                    </span>
                    <p className="text-xs text-ink/50 mt-2 italic">
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
                <div className="pt-4 border-t border-ink/15">
                    <span className="text-xs text-ink/50 font-medium mb-2 block">Neutrals</span>
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

    const ScoreBar = ({ label, score }) => (
        <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
                <span className="label-caps">{label}</span>
                <span className="font-serif text-sm">{score}/10</span>
            </div>
            <div className="h-3.5 border-2 border-ink bg-white">
                <div className="h-full bg-acid border-r-2 border-ink" style={{ width: `${Math.min(100, score * 10)}%` }} />
            </div>
        </div>
    );

    return (
        <div className="card-hard p-4">
            <h3 className="label-caps mb-4">Style Analysis</h3>

            {/* Current Aesthetic */}
            {current_aesthetic && (
                <div className="mb-4 p-3 border-2 border-ink bg-stone/40">
                    <span className="text-xs text-ink/50 block mb-1">Current Aesthetic</span>
                    <span className="text-lg font-bold text-ink">{current_aesthetic}</span>
                </div>
            )}

            {/* Scores */}
            <ScoreBar label="Proportion" score={proportion_score} />
            <ScoreBar label="Color Harmony" score={color_harmony_score} />

            {/* Occasion Versatility */}
            {occasion_versatility.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ink/15">
                    <span className="text-xs text-ink/50 font-medium mb-2 block">Works For</span>
                    <div className="flex flex-wrap gap-2">
                        {occasion_versatility.map((occasion, idx) => (
                            <span key={idx} className="chip-hard">
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
        <div className="card-hard p-4">
            <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-4 h-4" />
                <h3 className="label-caps">Style Upgrades</h3>
            </div>

            <div className="space-y-4">
                {gaps.map((gap, idx) => (
                    <div
                        key={idx}
                        className="p-3 border-2 border-ink bg-stone/30"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <span className="label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block mb-2">
                                    {gap.category}
                                </span>
                                <p className="text-ink/70 font-medium mb-1">{gap.issue}</p>
                                <p className="text-ink/70 text-sm">{gap.suggestion}</p>
                            </div>
                            {gap.search_terms && gap.search_terms.length > 0 && onSearchProduct && (
                                <button
                                    onClick={() => onSearchProduct(gap.search_terms[0])}
                                    className="flex-shrink-0 chip-hard btn-press shadow-hard-sm bg-acid"
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
            <div className="card-hard p-6 text-center">
                <div className="animate-spin w-8 h-8 border-3 border-ink border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-ink/70 font-medium">Analyzing colors and style...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border-[3px] border-ink bg-white p-4">
                <p className="text-sm font-bold">Analysis failed: {error}</p>
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
                <div className="card-hard p-4">
                    <h4 className="label-caps mb-2">💡 Color Theory Insight</h4>
                    <p className="text-sm text-ink/80">{analysis.color_theory_notes}</p>
                </div>
            )}

            {/* Improvement Gaps */}
            <ImprovementGaps gaps={analysis.improvement_gaps} onSearchProduct={onSearchProduct} />
        </div>
    );
};

export default OutfitAnalysisPanel;
