import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutfits } from '../hooks/useOutfits';
import { ArrowLeft, Trash2, Calendar, Star, Loader2, ImageOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SavedOutfitsPage() {
    const { user, loading: authLoading } = useAuth();
    const { outfits, loading, deleteOutfit } = useOutfits();
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen animated-gradient relative overflow-hidden font-sans flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your saved outfits</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const handleDelete = async (outfit, e) => {
        e.stopPropagation();
        if (!confirm('Delete this outfit?')) return;

        setDeleting(outfit.id);
        try {
            await deleteOutfit(outfit.id, outfit.photo_url);
            if (selectedOutfit?.id === outfit.id) {
                setSelectedOutfit(null);
            }
        } catch (err) {
            alert('Failed to delete outfit');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getModeLabel = (mode) => {
        const labels = {
            professional: 'Alexandra Ashford',
            balanced: 'Margot Leclerc',
            hype: 'Kai Chen',
            roast: 'Marcus Stone'
        };
        return labels[mode] || mode;
    };

    return (
        <div className="min-h-screen animated-gradient relative overflow-hidden font-sans">
            {/* Background effects */}
            <div className="particle particle-1 floating"></div>
            <div className="particle particle-2 floating-delayed"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

            <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-full transition-all hover:scale-105"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-black text-white">My Saved Outfits</h1>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                        </div>
                    ) : outfits.length === 0 ? (
                        <div className="text-center py-20">
                            <ImageOff className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">No saved outfits yet</h2>
                            <p className="text-slate-400 mb-6">Rate an outfit and click "Save" to add it here!</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-all"
                            >
                                Rate an Outfit
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {outfits.map((outfit) => (
                                <div
                                    key={outfit.id}
                                    onClick={() => setSelectedOutfit(outfit)}
                                    className="group relative bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-orange-500/50 transition-all cursor-pointer hover:scale-[1.02]"
                                >
                                    {/* Photo */}
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img
                                            src={outfit.photo_url}
                                            alt="Outfit"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="w-4 h-4 text-orange-400" />
                                            <span className="text-white font-bold">{outfit.numeric_rating}/10</span>
                                        </div>
                                        <p className="text-slate-300 text-sm truncate">{getModeLabel(outfit.advisor_mode)}</p>
                                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(outfit.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(outfit, e)}
                                        disabled={deleting === outfit.id}
                                        className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {deleting === outfit.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOutfit && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOutfit(null)}
                >
                    <div
                        className="bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col lg:flex-row max-h-[90vh]">
                            {/* Image */}
                            <div className="lg:w-1/2 flex-shrink-0">
                                <img
                                    src={selectedOutfit.photo_url}
                                    alt="Outfit"
                                    className="w-full h-64 lg:h-full object-cover"
                                />
                            </div>

                            {/* Details */}
                            <div className="lg:w-1/2 p-6 overflow-y-auto">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-6 h-6 text-orange-400" />
                                            <span className="text-3xl font-black text-white">{selectedOutfit.numeric_rating}/10</span>
                                        </div>
                                        <p className="text-orange-400 font-semibold">{getModeLabel(selectedOutfit.advisor_mode)}</p>
                                        <p className="text-slate-400 text-sm">{formatDate(selectedOutfit.created_at)}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOutfit(null)}
                                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {selectedOutfit.social_summary && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                        <p className="text-white italic">"{selectedOutfit.social_summary}"</p>
                                    </div>
                                )}

                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{selectedOutfit.rating_text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
