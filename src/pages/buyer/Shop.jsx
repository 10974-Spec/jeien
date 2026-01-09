import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Filter, X, ChevronDown, ChevronUp, Star, Check,
  Truck, Shield, RefreshCw, Search, SlidersHorizontal,
  Package, TrendingUp, Clock, Zap, Flame, Percent,
  ChevronRight, ChevronLeft
} from 'lucide-react'
import productService from '../../services/product.service'
import categoryService from '../../services/category.service'

// ProductCard component for shop page
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images || []
  const allImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400']

  const nextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  return (
    <motion.div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          {isHovered && allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <img
            src={allImages[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
            }}
          />

          {product.discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                -{product.discount || Math.round((1 - (product.price / (product.comparePrice || product.price * 1.3))) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 px-1">
          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 hover:text-blue-700 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg text-blue-700">
              KES {product.price?.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                KES {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
          {product.vendor && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {product.vendor?.storeName || product.vendor?.name || 'Unknown Vendor'}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(20)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Initialize filters from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')
    const ratingParam = searchParams.get('minRating')
    const stockParam = searchParams.get('inStock')
    const sortParam = searchParams.get('sort')
    const orderParam = searchParams.get('order')
    const searchQuery = searchParams.get('q')

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','))
    }
    if (minPriceParam && maxPriceParam) {
      setPriceRange([parseInt(minPriceParam), parseInt(maxPriceParam)])
    }
    if (ratingParam) {
      setMinRating(parseInt(ratingParam))
    }
    if (stockParam) {
      setInStockOnly(stockParam === 'true')
    }
    if (sortParam) {
      setSortBy(sortParam)
    }
    if (orderParam) {
      setSortOrder(orderParam)
    }

    fetchCategories()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [selectedCategories, priceRange, minRating, inStockOnly, sortBy, sortOrder, currentPage, searchParams])

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getFeaturedCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sortBy,
        sortOrder,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStock: inStockOnly ? 'true' : undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        q: searchParams.get('q'),
        deals: searchParams.get('deals') === 'true'
      }

      // Clean up undefined parameters
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

      const response = await productService.getAllProducts(params)
      setProducts(response.data?.products || [])
      setTotalProducts(response.data?.pagination?.total || 0)

      // Update URL with current filters
      const newParams = new URLSearchParams()
      if (selectedCategories.length > 0) newParams.set('category', selectedCategories.join(','))
      if (priceRange[0] > 0) newParams.set('minPrice', priceRange[0])
      if (priceRange[1] < 100000) newParams.set('maxPrice', priceRange[1])
      if (minRating > 0) newParams.set('minRating', minRating)
      if (inStockOnly) newParams.set('inStock', 'true')
      if (sortBy !== 'createdAt') newParams.set('sort', sortBy)
      if (sortOrder !== 'desc') newParams.set('order', sortOrder)
      if (searchParams.get('q')) newParams.set('q', searchParams.get('q'))
      if (searchParams.get('deals')) newParams.set('deals', 'true')

      setSearchParams(newParams)

    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
    setCurrentPage(1)
  }

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange]
    newRange[index] = parseInt(value) || 0
    setPriceRange(newRange)
    setCurrentPage(1)
  }

  const handleRatingClick = (rating) => {
    setMinRating(minRating === rating ? 0 : rating)
    setCurrentPage(1)
  }

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 100000])
    setMinRating(0)
    setInStockOnly(false)
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
    setSearchParams(new URLSearchParams())
  }

  const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-4 text-left"
        >
          <span className="font-semibold text-gray-900">{title}</span>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {isOpen && <div className="pb-4 space-y-3">{children}</div>}
      </div>
    )
  }

  const SortButton = ({ label, value, icon: Icon }) => (
    <button
      onClick={() => handleSortChange(value)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        sortBy === value
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {sortBy === value && (
        <span className="ml-1 text-xs">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-8 lg:py-12 mb-8 rounded-2xl">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {searchParams.get('q')
                ? `Search Results for "${searchParams.get('q')}"`
                : searchParams.get('deals')
                ? '🔥 Hot Deals'
                : 'Shop Products'}
            </h1>
            <p className="text-blue-100 mb-6">
              {totalProducts > 0 
                ? `${totalProducts.toLocaleString()} products found` 
                : 'Browse our amazing collection'}
            </p>
            <div className="flex flex-wrap gap-2">
              {searchParams.get('q') && (
                <button
                  onClick={() => {
                    searchParams.delete('q')
                    setSearchParams(searchParams)
                  }}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-2 hover:bg-white/30"
                >
                  Search: {searchParams.get('q')}
                  <X className="h-3 w-3" />
                </button>
              )}
              {searchParams.get('deals') && (
                <button
                  onClick={() => {
                    searchParams.delete('deals')
                    setSearchParams(searchParams)
                  }}
                  className="px-4 py-2 bg-red-500 rounded-full text-sm flex items-center gap-2 hover:bg-red-600"
                >
                  <Flame className="h-3 w-3" />
                  Hot Deals
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear All
                  </button>
                </div>

                {/* Categories */}
                <FilterSection title="Categories">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category._id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({category.stats?.totalProducts || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(0, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Min"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(1, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Max"
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Up to KES {priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Minimum Rating">
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleRatingClick(rating)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm ${
                          minRating >= rating
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2">& above</span>
                        {minRating >= rating && (
                          <Check className="h-4 w-4 ml-auto text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Stock Status */}
                <FilterSection title="Stock Status">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() => setInStockOnly(!inStockOnly)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In stock only</span>
                  </label>
                </FilterSection>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Free Shipping</h4>
                    <p className="text-xs text-gray-500">On orders over KES 5,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Secure Payment</h4>
                    <p className="text-xs text-gray-500">100% protected</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{totalProducts.toLocaleString()}</span> products found
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <SortButton label="Newest" value="createdAt" icon={Clock} />
                <SortButton label="Price: Low to High" value="price" icon={TrendingUp} />
                <SortButton label="Price: High to Low" value="price" icon={TrendingUp} />
                <SortButton label="Best Rated" value="rating" icon={Star} />
                <SortButton label="Most Popular" value="popularity" icon={Zap} />
                <SortButton label="Best Selling" value="sales" icon={Flame} />
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalProducts > productsPerPage && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(Math.ceil(totalProducts / productsPerPage)).keys()].slice(0, 5).map(page => (
                        <button
                          key={page + 1}
                          onClick={() => setCurrentPage(page + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === page + 1
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalProducts / productsPerPage)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category._id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({category.stats?.totalProducts || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(0, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Min"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(1, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleRatingClick(rating)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm ${
                          minRating >= rating
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2">& above</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Stock Status</h3>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() => setInStockOnly(!inStockOnly)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In stock only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopPage