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
        <div className="group relative bg-white overflow-hidden border-2 border-ink shadow-hard-sm">
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-stone overflow-hidden border-b-2 border-ink">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-ink/30 animate-spin" />
                    </div>
                )}
                <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        setImageLoaded(true);
                    }}
                />

                {/* Store Badge */}
                <div className="absolute top-3 left-3 right-12">
                    <span className="chip-hard max-w-full">
                        <span className="truncate">{product.store}</span>
                    </span>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`absolute top-2 right-2 p-1.5 border-2 border-ink transition-colors ${isSaved
                            ? 'bg-ink text-acid'
                            : 'bg-white hover:bg-acid'
                        }`}
                    title={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
                >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-ink text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.title}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-ink fill-current" />
                        <span className="text-sm font-medium text-ink/70">{product.rating}</span>
                        {product.reviewCount > 0 && (
                            <span className="text-xs text-ink/50">({product.reviewCount})</span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-lg font-bold text-ink">{product.price}</span>

                    {/* View Button */}
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chip-hard btn-press shadow-hard-sm bg-acid"
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
        <div className="card-hard p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4" />
                    <div>
                        <h3 className="label-caps">Shop the Look</h3>
                        {searchQuery && (
                            <p className="text-sm text-ink/50">
                                Results for "{searchQuery}"
                            </p>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="chip-hard btn-press shadow-hard-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-ink animate-spin mx-auto mb-3" />
                        <p className="text-ink/70 font-medium">Finding products...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-6 border-2 border-ink">
                    <p className="font-bold text-sm">Failed to load products</p>
                    <p className="text-ink/60 text-xs mt-1">{error}</p>
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
                                className="chip-hard btn-press shadow-hard-sm"
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
                    <ShoppingBag className="w-12 h-12 text-ink/30 mx-auto mb-3" />
                    <p className="text-ink/70 font-medium">No products found</p>
                    <p className="text-ink/50 text-sm mt-1">Try a different search term</p>
                </div>
            )}
        </div>
    );
};

export default ProductRecommendations;
