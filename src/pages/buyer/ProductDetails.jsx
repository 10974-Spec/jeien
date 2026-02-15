import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import useAnalytics from '../../hooks/useAnalytics'
import productService from '../../services/product.service'
import reviewService from '../../services/review.service'
import Breadcrumb from '../../components/Breadcrumb'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { addToCart, isInCart, getItemCount } = useCart()
  const { trackProductView, trackAddToCart } = useAnalytics()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [pricingType, setPricingType] = useState('retail') // 'retail' or 'wholesale'
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
  })

  useEffect(() => {
    if (id) {
      fetchProductDetails()
    }
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await productService.getProductById(id)
      const productData = response.data.product

      if (!productData) {
        throw new Error('Product not found')
      }

      setProduct(productData)
      setSelectedImage(0)

      // Track product view
      trackProductView(productData._id, productData.title)

      // Fetch reviews
      const reviewsRes = await reviewService.getProductReviews(productData._id)
      setReviews(reviewsRes.data.reviews || [])

      // Fetch similar products
      const similarRes = await productService.getAllProducts({
        category: productData.category?._id,
        limit: 4,
        exclude: productData._id
      })
      setSimilarProducts(similarRes.data.products || [])

    } catch (error) {
      console.error('Failed to fetch product details:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return

    addToCart({
      ...product,
      quantity: quantity,
      selectedPricingType: pricingType // Add selected pricing type
    })

    // Track add to cart
    trackAddToCart(product._id, product.title, quantity)

    setQuantity(1)
  }

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return

    addToCart({
      ...product,
      quantity: quantity,
      selectedPricingType: pricingType // Add selected pricing type
    })
    navigate('/cart')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await reviewService.createReview({
        productId: id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
      })

      setReviewData({ rating: 5, title: '', comment: '' })
      fetchProductDetails()
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Failed to submit review: ' + error.message)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1
    if (product) {
      setQuantity(Math.max(1, Math.min(value, product.stock)))
    } else {
      setQuantity(Math.max(1, value))
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const cartItemCount = getItemCount(product._id)
  const isProductInCart = isInCart(product._id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: product.category?.name || 'Category', path: `/category/${product.category?._id}` },
          { name: product.title }
        ]}
      />

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Product Images */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-gray-400">📷</span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${selectedImage === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 p-6 border-l border-gray-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
                {product.sku && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  KES {product.price?.toLocaleString()}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      KES {product.comparePrice.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-bold">
                      Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.averageRating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.averageRating?.toFixed(1) || '0.0'} ({reviews.length} reviews)
                </span>
                {product.stats?.sales && (
                  <span className="text-gray-600">
                    • {product.stats.sales} sold
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {product.vendor && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-32">Vendor:</span>
                  <Link
                    to={`/vendor/${product.vendor._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                  >
                    {product.vendor.storeName || product.vendor.name}
                    {product.vendor.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        ✓ Verified
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {product.category && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-32">Category:</span>
                  <Link
                    to={`/category/${product.category._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}

              <div className="flex items-center">
                <span className="text-gray-600 w-32">Stock Status:</span>
                <span className={`font-medium ${product.stock > 10 ? 'text-green-600' :
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {product.stock > 10 ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                      In Stock ({product.stock} available)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                      Low Stock (Only {product.stock} left)
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                      Out of Stock
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Pricing Type Selector - Only show if wholesale is available */}
            {product.allowWholesale && product.wholesalePrice && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Choose Pricing Option
                </h3>
                <div className="space-y-3">
                  {/* Retail Option */}
                  <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${pricingType === 'retail'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pricingType"
                        value="retail"
                        checked={pricingType === 'retail'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-800">Retail Price</div>
                        <div className="text-sm text-gray-600">Standard pricing for any quantity</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        KES {product.price?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </div>
                  </label>

                  {/* Wholesale Option */}
                  <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${pricingType === 'wholesale'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pricingType"
                        value="wholesale"
                        checked={pricingType === 'wholesale'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          Wholesale Price
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                            Save {Math.round(((product.price - product.wholesalePrice) / product.price) * 100)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Minimum {product.minWholesaleQuantity || 10} units required
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        KES {product.wholesalePrice?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </div>
                  </label>
                </div>

                {/* Warning if wholesale selected but quantity too low */}
                {pricingType === 'wholesale' && quantity < (product.minWholesaleQuantity || 10) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <strong>Note:</strong> Increase quantity to at least {product.minWholesaleQuantity || 10} units to qualify for wholesale pricing.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-medium text-gray-800 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className={`px-4 py-3 hover:bg-gray-100 ${quantity <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                      }`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center py-3 border-x focus:outline-none"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={!product || quantity >= product.stock}
                    className={`px-4 py-3 hover:bg-gray-100 ${!product || quantity >= product.stock ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                      }`}
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Max: {product.stock} units available
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mb-6">
              {isProductInCart ? (
                <div className="flex-1">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added to cart ({cartItemCount} items)
                    </p>
                    <button
                      onClick={() => navigate('/cart')}
                      className="mt-2 text-green-700 hover:text-green-900 font-medium"
                    >
                      View Cart →
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product || product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-all ${!product || product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {!product || product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}

              <button
                onClick={handleBuyNow}
                disabled={!product || product.stock === 0}
                className={`py-4 px-8 rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-all ${!product || product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Buy Now
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-gray-600">Shipping:</span>
                {product.shipping?.freeShipping ? (
                  <span className="text-green-600 font-medium">Free Shipping</span>
                ) : (
                  <span>KES {product.shipping?.cost?.toLocaleString() || '0'}</span>
                )}
              </div>
              {product.shipping?.estimatedDays && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estimated delivery: {product.shipping.estimatedDays.min}-{product.shipping.estimatedDays.max} days</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-8 py-4 font-medium border-b-2 transition-colors ${activeTab === 'description'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-8 py-4 font-medium border-b-2 transition-colors ${activeTab === 'specifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 font-medium border-b-2 transition-colors ${activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Product Description</h3>
                <div className="prose max-w-none">
                  {product.description ? (
                    product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No description available for this product.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Specifications</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="border-b pb-3">
                        <span className="font-medium text-gray-600 block mb-1">{spec.key}:</span>
                        <span className="text-gray-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold">Customer Reviews</h3>
                  <button
                    onClick={() => setActiveTab('write-review')}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-8 last:border-0 last:pb-0">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {review.buyerInfo?.profileImage ? (
                                <img
                                  src={review.buyerInfo.profileImage}
                                  alt={review.buyerInfo.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 text-xl">👤</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.buyerInfo?.name || 'Anonymous'}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="flex items-center mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                {review.verifiedPurchase && (
                                  <span className="ml-2 text-green-600">✓ Verified Purchase</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {review.title && (
                          <h4 className="font-medium text-lg mb-3">{review.title}</h4>
                        )}

                        <p className="text-gray-700 mb-4">{review.comment}</p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex space-x-2 mb-4">
                            {review.images.slice(0, 3).map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Review ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        {review.reply && (
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-medium text-gray-800">Vendor Response</p>
                              <p className="text-sm text-gray-500">
                                {new Date(review.reply.repliedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-gray-700">{review.reply.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'write-review' && (
              <div>
                <h3 className="text-2xl font-bold mb-8">Write a Review</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="text-3xl transition-transform hover:scale-110"
                          >
                            {star <= reviewData.rating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Summarize your experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="6"
                        placeholder="Share details about your experience with this product..."
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-gray-600 text-lg mb-6">Please login to write a review</p>
                    <button
                      onClick={() => navigate('/login', { state: { from: `/product/${id}` } })}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Login to Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Similar Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <div
                key={similarProduct._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/product/${similarProduct._id}`)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {similarProduct.images?.[0] ? (
                    <img
                      src={similarProduct.images[0]}
                      alt={similarProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl text-gray-400">📷</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-800 truncate mb-1">{similarProduct.title}</h4>
                  <p className="text-gray-500 text-sm truncate mb-3">
                    {similarProduct.vendor?.storeName}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-600">
                      KES {similarProduct.price?.toLocaleString()}
                    </span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails