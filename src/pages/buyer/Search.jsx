import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
    Search as SearchIcon, Filter, X, ChevronDown, Heart,
    ShoppingCart, Star, Loader2, SlidersHorizontal
} from 'lucide-react'
import productService from '../../services/product.service'
import categoryService from '../../services/category.service'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'

// Button Component
const Button = ({ children, variant = 'default', size = 'md', className = '', disabled = false, loading = false, onClick, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
        default: 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900',
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        ghost: 'bg-transparent hover:bg-gray-100',
        outline: 'bg-transparent border border-gray-300 hover:bg-gray-50',
    }
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'relative' : ''}`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
            <span className={loading ? 'opacity-0' : ''}>{children}</span>
        </button>
    )
}

// Product Card Component
const ProductCard = ({ product }) => {
    const [addingToCart, setAddingToCart] = useState(false)
    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const inWishlist = isInWishlist(product._id)

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
                toast.success('Removed from wishlist', {
                    icon: '💔',
                    duration: 2000,
                })
            } else {
                toast.success('Added to wishlist!', {
                    icon: '❤️',
                    duration: 2000,
                })
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error)
            toast.error('Failed to update wishlist')
        }
    }

    const image = product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
    const discount = product.discount || 0
    const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price

    return (
        <Link to={`/product/${product._id}`}>
            <motion.div
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                whileHover={{ y: -4 }}
            >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
                        }}
                    />

                    {discount > 0 && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                -{discount}%
                            </span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            variant="secondary"
                            className={`h-9 w-9 rounded-full p-0 ${inWishlist ? 'bg-red-100 hover:bg-red-200' : ''}`}
                            onClick={handleToggleWishlist}
                        >
                            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                        {product.title}
                    </h3>

                    {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                KSh {finalPrice.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="text-sm text-gray-500 line-through">
                                    KSh {product.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        loading={addingToCart}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </motion.div>
        </Link>
    )
}

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    const searchQuery = searchParams.get('q') || ''

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [searchParams])

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories()
            setCategories(response.data.categories || [])
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = {
                search: searchQuery,
                category: filters.category,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            }

            // Remove empty params
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key]
            })

            const response = await productService.getAllProducts(params)
            setProducts(response.data.products || [])
        } catch (error) {
            console.error('Failed to fetch products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)

        // Update URL params
        const newParams = new URLSearchParams(searchParams)
        if (value) {
            newParams.set(key, value)
        } else {
            newParams.delete(key)
        }
        setSearchParams(newParams)
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'createdAt',
            sortOrder: 'desc',
        })
        setSearchParams({ q: searchQuery })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {loading ? 'Loading...' : `${products.length} products found`}
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Price Range (KSh)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                                >
                                    <option value="createdAt">Newest</option>
                                    <option value="price">Price</option>
                                    <option value="title">Name</option>
                                    <option value="rating">Rating</option>
                                </select>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Search
