import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import productService from '../../services/product.service'
import categoryService from '../../services/category.service'
import Breadcrumb from '../../components/Breadcrumb'

const Category = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [isAllCategories, setIsAllCategories] = useState(false)
  const [allCategories, setAllCategories] = useState([])

  useEffect(() => {
    if (id) {
      fetchCategoryData()
    }
  }, [id, filters, page])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)

      // Handle "all" category special case
      if (id === 'all') {
        setIsAllCategories(true)

        // Fetch all categories
        const categoriesRes = await categoryService.getAllCategories({ limit: 20 })
        setAllCategories(categoriesRes.data.categories || [])

        // Fetch all products without category filter
        const params = {
          page,
          limit: 12,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }

        const productsRes = await productService.getAllProducts(params)
        setProducts(productsRes.data.products || [])
        setTotalProducts(productsRes.data.total || 0)
        setTotalPages(productsRes.data.pages || 1)

        setBreadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'All Categories', path: '/category/all' }
        ])

        return
      }

      setIsAllCategories(false)

      // Fetch category details for specific category
      const categoryRes = await categoryService.getCategoryById(id)
      const categoryData = categoryRes.data.category

      if (!categoryData) {
        throw new Error('Category not found')
      }

      setCategory(categoryData)
      setSubcategories(categoryData.children || [])

      // Build breadcrumbs
      const bc = [{ name: 'Home', path: '/' }]
      if (categoryData.parent) {
        const parentRes = await categoryService.getCategoryById(categoryData.parent)
        if (parentRes.data.category) {
          bc.push({
            name: parentRes.data.category.name,
            path: `/category/${categoryData.parent}`
          })
        }
      }
      bc.push({ name: categoryData.name, path: `/category/${categoryData._id}` })
      setBreadcrumbs(bc)

      // Fetch products for this category
      const params = {
        page,
        limit: 12,
        category: id,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      const productsRes = await productService.getAllProducts(params)
      setProducts(productsRes.data.products || [])
      setTotalProducts(productsRes.data.total || 0)
      setTotalPages(productsRes.data.pages || 1)

    } catch (error) {
      console.error('Failed to fetch category data:', error)
      if (error.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid category ID')) {
        // If it's an invalid category ID, redirect to all categories
        navigate('/category/all', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || ''
    }))
    setPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="flex gap-6">
              <div className="w-1/4">
                <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-3/4">
                <div className="grid grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render All Categories view
  if (isAllCategories) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        <div className="container mx-auto px-4 py-8">
          {/* All Categories Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                All Categories
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Browse products from all categories
              </p>
              <div className="flex items-center gap-4 text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  {totalProducts} products across all categories
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Categories Grid */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Categories</h2>
                <div className="space-y-3">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat._id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
                    >
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {cat.stats?.totalProducts || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-2">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    All Products
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Showing {products.length} of {totalProducts} products
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Price Range (KES)</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="px-3 py-2 border border-gray-300 rounded-lg w-32"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="px-3 py-2 border border-gray-300 rounded-lg w-32"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="createdAt">Newest</option>
                      <option value="price">Price</option>
                      <option value="averageRating">Rating</option>
                      <option value="popularity">Popularity</option>
                    </select>

                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or browse specific categories</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-orange-300"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-800 group-hover:text-orange-700 truncate mb-2">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate mb-3">
                            {product.vendor?.storeName}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xl text-orange-600">
                                KES {product.price?.toLocaleString()}
                              </span>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  KES {product.comparePrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {product.averageRating > 0 && (
                                <>
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">{product.averageRating?.toFixed(1)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className={`text-sm font-medium ${product.stock > 10
                              ? 'text-green-600'
                              : product.stock > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}>
                              {product.stock > 10
                                ? `${product.stock} in stock`
                                : product.stock > 0
                                  ? `Only ${product.stock} left`
                                  : 'Out of stock'
                              }
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className={`px-4 py-2 rounded-lg border ${page === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          ← Previous
                        </button>

                        {page > 3 && (
                          <>
                            <button
                              onClick={() => setPage(1)}
                              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              1
                            </button>
                            <span className="px-2 text-gray-500">...</span>
                          </>
                        )}

                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum = page <= 3 ? i + 1 :
                            page >= totalPages - 2 ? totalPages - 4 + i :
                              page - 2 + i
                          if (pageNum < 1 || pageNum > totalPages) return null

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-4 py-2 rounded-lg border ${page === pageNum
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        {page < totalPages - 2 && (
                          <>
                            <span className="px-2 text-gray-500">...</span>
                            <button
                              onClick={() => setPage(totalPages)}
                              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className={`px-4 py-2 rounded-lg border ${page === totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Category not found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 text-lg mb-4 max-w-3xl">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    {totalProducts} products
                  </span>
                  {category.stats?.totalVendors > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {category.stats.totalVendors} vendors
                    </span>
                  )}
                </div>
              </div>

              {category.image && (
                <div className="flex-shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-40 h-40 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Subcategories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {subcategories.map((subcat) => (
                    <Link
                      key={subcat._id}
                      to={`/category/${subcat._id}`}
                      className="group bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl p-4 text-center transition-all hover:shadow-md"
                    >
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r from-orange-100 to-pink-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-pink-200">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-800 group-hover:text-orange-700 text-sm truncate">
                        {subcat.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {subcat.stats?.totalProducts || 0} products
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Price Range (KES)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Min</label>
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Max</label>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="100000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSortChange('createdAt')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${filters.sortBy === 'createdAt'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span>Newest</span>
                      {filters.sortBy === 'createdAt' && (
                        <span className="text-orange-600">
                          {filters.sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleSortChange('price')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${filters.sortBy === 'price'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span>Price</span>
                      {filters.sortBy === 'price' && (
                        <span className="text-orange-600">
                          {filters.sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleSortChange('averageRating')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${filters.sortBy === 'averageRating'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span>Rating</span>
                      {filters.sortBy === 'averageRating' && (
                        <span className="text-orange-600">
                          {filters.sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleSortChange('popularity')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${filters.sortBy === 'popularity'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span>Popularity</span>
                      {filters.sortBy === 'popularity' && (
                        <span className="text-orange-600">
                          {filters.sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Products in {category.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or browse other categories</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-orange-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 group-hover:text-orange-700 truncate mb-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mb-3">
                          {product.vendor?.storeName}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xl text-orange-600">
                              KES {product.price?.toLocaleString()}
                            </span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                KES {product.comparePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {product.averageRating > 0 && (
                              <>
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm text-gray-600">{product.averageRating?.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`text-sm font-medium ${product.stock > 10
                            ? 'text-green-600'
                            : product.stock > 0
                              ? 'text-yellow-600'
                              : 'text-red-600'
                            }`}>
                            {product.stock > 10
                              ? `${product.stock} in stock`
                              : product.stock > 0
                                ? `Only ${product.stock} left`
                                : 'Out of stock'
                            }
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-lg border ${page === 1
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        ← Previous
                      </button>

                      {page > 3 && (
                        <>
                          <button
                            onClick={() => setPage(1)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            1
                          </button>
                          <span className="px-2 text-gray-500">...</span>
                        </>
                      )}

                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum = page <= 3 ? i + 1 :
                          page >= totalPages - 2 ? totalPages - 4 + i :
                            page - 2 + i
                        if (pageNum < 1 || pageNum > totalPages) return null

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg border ${page === pageNum
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      {page < totalPages - 2 && (
                        <>
                          <span className="px-2 text-gray-500">...</span>
                          <button
                            onClick={() => setPage(totalPages)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded-lg border ${page === totalPages
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Category