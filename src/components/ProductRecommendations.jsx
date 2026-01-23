import React, { useState } from 'react';
import { ShoppingBag, Star, ExternalLink, Heart, Loader2, Search, X } from 'lucide-react';

/**
 * Individual product card component
 */
export const ProductCard = ({ product, onSaveToWishlist }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setIsSaved(true);
        if (onSaveToWishlist) {
            onSaveToWishlist(product);
        }
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                    </div>
                )}
                <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        setImageLoaded(true);
                    }}
                />

                {/* Store Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                        {product.store}
                    </span>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${isSaved
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-pink-500 hover:text-white'
                        }`}
                    title={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
                >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.title}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                        {product.reviewCount > 0 && (
                            <span className="text-xs text-slate-400">({product.reviewCount})</span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{product.price}</span>

                    {/* View Button */}
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
};

/**
 * Product recommendations grid
 */
export const ProductRecommendations = ({
    products,
    loading,
    error,
    searchQuery,
    onSaveToWishlist,
    onSearchMore,
    onClose
}) => {
    if (!products || (products.length === 0 && !loading && !error)) {
        return null;
    }

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Shop the Look</h3>
                        {searchQuery && (
                            <p className="text-sm text-slate-500">
                                Results for "{searchQuery}"
                            </p>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Finding products...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-8 bg-red-50 rounded-2xl">
                    <p className="text-red-600 font-medium">Failed to load products</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onSaveToWishlist={onSaveToWishlist}
                            />
                        ))}
                    </div>

                    {/* More Results */}
                    {onSearchMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={onSearchMore}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                            >
                                <Search className="w-4 h-4" />
                                Search for more items
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && searchQuery && (
                <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No products found</p>
                    <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                </div>
            )}
        </div>
    );
};

export default ProductRecommendations;
