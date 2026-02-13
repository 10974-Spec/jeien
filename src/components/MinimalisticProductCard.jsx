import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'

// Badge Component
const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-blue-100 text-blue-800',
        destructive: 'bg-red-500 text-white',
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}

// Minimalistic Product Card with Sharp Corners
export const MinimalisticProductCard = ({ product }) => {
    const [addingToCart, setAddingToCart] = useState(false)

    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const inWishlist = isInWishlist(product._id)

    const images = product.images || []
    const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        setAddingToCart(true)
        try {
            addToCart(product, 1)
            toast.success('Added to cart!', {
                icon: '🛒',
                duration: 2000,
            })
        } catch (error) {
            console.error('Failed to add to cart:', error)
            toast.error('Failed to add to cart')
        } finally {
            setAddingToCart(false)
        }
    }

    const handleToggleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            toggleWishlist(product)
            if (inWishlist) {
                toast.success('Removed from wishlist', { icon: '💔', duration: 2000 })
            } else {
                toast.success('Added to wishlist!', { icon: '❤️', duration: 2000 })
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error)
            toast.error('Failed to update wishlist')
        }
    }

    return (
        <motion.div
            className="group bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            {/* Image Container */}
            <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
                    }}
                />

                {/* Badges */}
                {product.discount > 0 && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="destructive">-{product.discount}%</Badge>
                    </div>
                )}
                {product.isNew && !product.discount && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary">New</Badge>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 transition-colors ${inWishlist ? 'bg-red-50 border-red-200' : ''}`}
                >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>

                {/* Stock Status */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-4 py-2 text-sm font-medium text-gray-900">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Product Info */}
            <div className="p-3 space-y-2">
                <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 text-gray-900 hover:text-blue-700 transition-colors min-h-[40px]">
                        {product.title}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                        KES {product.price?.toLocaleString()}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                            KES {product.comparePrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Rating */}
                {product.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(product.averageRating || 0)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                    </div>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {addingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4" />
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    )
}

export default MinimalisticProductCard
