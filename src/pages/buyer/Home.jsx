import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ChevronRight, ArrowRight, Zap, Star, TrendingUp, Flame,
  Shield, Truck, Clock, Gift, Crown, Percent, Car, Smartphone,
  Shirt, Home as HomeIcon, Dumbbell, Sparkles, Baby, BookOpen, Laptop,
  Sofa, Watch, Gamepad2, Plane, HeartPulse, Music, Camera,
  Wrench, PawPrint, Gem, Heart, ShoppingCart, Eye,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Loader2, Menu, X, User, LogOut, LogIn, UserPlus
} from 'lucide-react'
import productService from '../../services/product.service'
import categoryService from '../../services/category.service'
import bannerService from '../../services/banner.service'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'

// Button Component
const Button = ({ children, variant = 'default', size = 'md', className = '', asChild = false, disabled = false, loading = false, href, onClick, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none'
  const variants = {
    default: 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900 hover:shadow-md',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  // Determine component to render
  let Comp = 'button'
  if (asChild) {
    // When asChild is true, we expect the children to handle the click
    Comp = 'span'
  } else if (href) {
    Comp = 'a'
  }

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'relative' : ''}`}
      disabled={disabled || loading}
      href={href}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin absolute left-4" />
      )}
      <span className={loading ? 'ml-2' : ''}>
        {children}
      </span>
    </Comp>
  )
}

// Badge Component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Product Card Component - FIXED: Removed nested <a> tags
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const inWishlist = isInWishlist(product._id)

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
      {/* Image Container with Link */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          {isHovered && allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
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

          {product.isNew && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary">New</Badge>
            </div>
          )}
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="destructive">-{product.discount}%</Badge>
            </div>
          )}

          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 right-3 flex flex-col gap-2 z-10"
              onClick={(e) => e.preventDefault()}
            >
              <Button
                size="sm"
                variant="secondary"
                className={`h-8 w-8 rounded-full p-0 ${inWishlist ? 'bg-red-100 hover:bg-red-200' : ''}`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Quick view logic here
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </Link>

      {/* Content - FIXED: Don't wrap in Link */}
      {!isHovered ? (
        <div className="mt-3 px-1">
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-medium text-sm line-clamp-1 hover:text-blue-700 transition-colors">
              {product.title}
            </h3>
          </Link>
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
          {product.allowWholesale && product.wholesalePrice && (
            <div className="mt-1">
              <span className="text-xs text-green-600 font-medium">
                Wholesale: KES {product.wholesalePrice?.toLocaleString()} (Min: {product.minWholesaleQuantity || 10})
              </span>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-0 right-0 -bottom-2 z-20 mx-1 p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl"
        >
          {product.vendor && (
            <Link
              to={`/vendor/${product.vendor?._id}`}
              className="text-xs text-gray-500 hover:text-blue-700 transition-colors block"
            >
              {product.vendor?.storeName || product.vendor?.name || 'Unknown Vendor'}
            </Link>
          )}

          <Link to={`/product/${product._id}`}>
            <h3 className="font-medium text-sm mt-1 line-clamp-2 hover:text-blue-700 transition-colors">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mt-2">
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

          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-lg text-blue-700">
              KES {product.price?.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                KES {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.allowWholesale && product.wholesalePrice && (
            <div className="mt-1.5 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-green-700">Wholesale:</span>
                <span className="text-xs font-bold text-green-800">
                  KES {product.wholesalePrice?.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-green-600">
                Min. {product.minWholesaleQuantity || 10} units
              </span>
            </div>
          )}

          <div className="mt-2">
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Button
            className="w-full mt-3 gap-2"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            loading={addingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Predefined gradient colors for categories without images
const categoryGradients = [
  'from-blue-500/20 to-blue-600/20',
  'from-green-500/20 to-green-600/20',
  'from-purple-500/20 to-purple-600/20',
  'from-pink-500/20 to-pink-600/20',
  'from-orange-500/20 to-orange-600/20',
  'from-teal-500/20 to-teal-600/20',
  'from-red-500/20 to-red-600/20',
  'from-yellow-500/20 to-yellow-600/20',
  'from-indigo-500/20 to-indigo-600/20',
  'from-cyan-500/20 to-cyan-600/20',
  'from-rose-500/20 to-rose-600/20',
  'from-emerald-500/20 to-emerald-600/20',
  'from-violet-500/20 to-violet-600/20',
  'from-fuchsia-500/20 to-fuchsia-600/20',
  'from-amber-500/20 to-amber-600/20',
  'from-lime-500/20 to-lime-600/20',
  'from-sky-500/20 to-sky-600/20',
  'from-cyan-500/20 to-blue-500/20',
  'from-pink-500/20 to-rose-500/20',
  'from-purple-500/20 to-indigo-500/20',
  'from-green-500/20 to-emerald-500/20',
]

// Icon mapping for categories
const categoryIcons = {
  'electronics': Smartphone,
  'fashion': Shirt,
  'clothing': Shirt,
  'home': HomeIcon,
  'furniture': Sofa,
  'sports': Dumbbell,
  'beauty': Sparkles,
  'cosmetics': Sparkles,
  'baby': Baby,
  'books': BookOpen,
  'computers': Laptop,
  'laptops': Laptop,
  'watches': Watch,
  'gaming': Gamepad2,
  'games': Gamepad2,
  'travel': Plane,
  'health': HeartPulse,
  'medical': HeartPulse,
  'music': Music,
  'photography': Camera,
  'tools': Wrench,
  'pets': PawPrint,
  'jewelry': Gem,
  'cars': Car,
  'automotive': Car,
  'food': Gift,
  'drinks': Gift,
  'education': BookOpen,
  'office': Laptop,
  'garden': HomeIcon,
  'kitchen': HomeIcon,
  'mobile': Smartphone,
  'tablets': Smartphone,
  'tv': Smartphone,
  'audio': Music,
  'wearables': Watch,
}

// Get gradient color based on category index
const getGradientForIndex = (index) => {
  return categoryGradients[index % categoryGradients.length]
}

// Get icon for category
const getIconForCategory = (categoryName, categorySlug) => {
  const key = (categorySlug || categoryName || '').toLowerCase()
  for (const [iconKey, Icon] of Object.entries(categoryIcons)) {
    if (key.includes(iconKey)) {
      return Icon
    }
  }
  return Smartphone // Default icon
}

// Category Section Component
const CategorySection = ({ categories, loading }) => {
  const [categoryImages, setCategoryImages] = useState({})
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (!categories || categories.length === 0) {
        setLoadingImages(false)
        return
      }

      try {
        setLoadingImages(true)

        // Fetch images sequentially to avoid rate limits
        const categoryData = []

        for (let i = 0; i < Math.min(categories.length, 21); i++) {
          const category = categories[i]
          try {
            // Add delay between requests
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 200))
            }

            const response = await categoryService.getCategoryById(category._id)
            categoryData.push({
              id: category._id,
              image: response.data?.image || null,
              gradient: getGradientForIndex(i)
            })
          } catch (error) {
            console.error(`Failed to fetch image for category ${category._id}:`, error)
            categoryData.push({
              id: category._id,
              image: null,
              gradient: getGradientForIndex(i)
            })
          }
        }

        const imagesMap = {}
        categoryData.forEach(data => {
          imagesMap[data.id] = {
            image: data.image,
            gradient: data.gradient
          }
        })
        setCategoryImages(imagesMap)
      } catch (error) {
        console.error('Failed to fetch category images:', error)
      } finally {
        setLoadingImages(false)
      }
    }

    fetchCategoryImages()
  }, [categories])

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse by Category</h2>
              <p className="text-gray-600 mt-1">Explore our wide range of products</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {[...Array(14)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-600 mt-1">Explore our wide range of products</p>
          </div>
          <Link to="/category/all" className="flex items-center gap-1 text-blue-700 font-medium hover:underline">
            All Categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingImages ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {[...Array(14)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {categories.slice(0, 21).map((category, index) => {
              const Icon = getIconForCategory(category.name, category.slug)
              const categoryData = categoryImages[category._id] || {
                image: null,
                gradient: getGradientForIndex(index)
              }
              const hasImage = categoryData.image

              return (
                <motion.div
                  key={category._id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={`/category/${category._id}`}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-200 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl mb-3 overflow-hidden ${!hasImage ? categoryData.gradient + ' flex items-center justify-center' : ''}`}>
                      {hasImage ? (
                        <img
                          src={categoryData.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.parentElement.className += ` ${categoryData.gradient}`
                            e.target.parentElement.innerHTML = ''
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${categoryData.gradient}`}>
                          <Icon className="h-6 w-6 text-white/80" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-medium text-xs text-center leading-tight">{category.name}</h3>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      {category.stats?.totalProducts || 0} items
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// Deals Section Component - FIXED: Removed nested <a> tags
const DealsSection = ({ deals, loading }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const CountdownTimer = () => (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">
        {String(timeLeft.hours).padStart(2, "0")}
      </span>
      <span>:</span>
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">
        {String(timeLeft.minutes).padStart(2, "0")}
      </span>
      <span>:</span>
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  )

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Deals of the Day</h2>
                <p className="text-gray-600">Hurry up! Limited time offers</p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!deals || deals.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Deals of the Day</h2>
              <p className="text-gray-600">Hurry up! Limited time offers</p>
            </div>
          </div>
          <Button variant="ghost" className="gap-1" href="/search?deals=true">
            All Deals <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.slice(0, 4).map((deal, index) => (
            <motion.div
              key={deal._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Link to={`/product/${deal._id}`} className="block">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={deal.images?.[0] || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop'}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop'
                    }}
                  />
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold">
                    -{Math.round((1 - (deal.price / (deal.comparePrice || deal.price * 1.3))) * 100)}%
                  </Badge>
                </div>
              </Link>

              <div className="p-4 space-y-3">
                <Link to={`/product/${deal._id}`}>
                  <h3 className="font-medium line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {deal.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-blue-700">
                    KES {deal.price?.toLocaleString()}
                  </span>
                  {deal.comparePrice && deal.comparePrice > deal.price && (
                    <span className="text-sm text-gray-500 line-through">
                      KES {deal.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Ends in:</span>
                  <CountdownTimer />
                </div>

                <Button className="w-full" size="sm" href={`/product/${deal._id}`}>
                  Grab Deal
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Products Component
const FeaturedProducts = ({ products, loading }) => {
  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600">Handpicked items just for you</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-blue-100/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600">Handpicked items just for you</p>
            </div>
          </div>
          <Button variant="ghost" className="gap-1" href="/search?featured=true">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Promo Banner Component
const PromoBanner = ({ banners, loading, position = null }) => {
  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-48 rounded-2xl bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Filter banners by position if specified
  let filteredBanners = banners;
  if (position) {
    filteredBanners = banners.filter(banner => banner.position === position);
  }

  if (filteredBanners.length === 0) {
    // Show default banners if no banners for this position
    const defaultBanners = [
      {
        id: 1,
        title: "Exclusive Deals Up to 60% Off",
        description: "Discover our premium collection with exclusive discounts on top brands and products.",
        link: "/search?sale=premium",
        label: "🔥 Premium Collection"
      },
      {
        id: 2,
        title: "New Arrivals",
        description: "Check out our latest products just added to the collection.",
        link: "/search?sort=newest",
        label: "✨ Just In"
      }
    ];

    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            {defaultBanners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-2xl ${index === 0 ? 'bg-gradient-to-br from-blue-700 to-blue-800' : 'bg-gradient-to-br from-blue-800 to-blue-900'} p-6 lg:p-8 text-white`}
              >
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
                    {banner.label}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {banner.description}
                  </p>
                  <Button variant="secondary" size="sm" href={banner.link}>
                    Shop Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4">
          {filteredBanners.slice(0, 2).map((banner, index) => (
            <motion.div
              key={banner._id || index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl ${index === 0 ? 'bg-gradient-to-br from-blue-700 to-blue-800' : 'bg-gradient-to-br from-blue-800 to-blue-900'} p-6 lg:p-8 text-white`}
            >
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
                  {banner.label || 'Special Offer'}
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                  {banner.title}
                </h3>
                <p className="text-white/80 mb-4">
                  {banner.description}
                </p>
                <Button variant="secondary" size="sm" href={banner.link || '/search'}>
                  Shop Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Component
const Features = () => {
  const features = [
    { icon: Truck, title: "Free Delivery", desc: "On orders over KES 5,000" },
    { icon: Shield, title: "Secure Payment", desc: "100% protected" },
    { icon: Clock, title: "24/7 Support", desc: "Always here for you" },
    { icon: Gift, title: "Rewards", desc: "Earn points on every order" },
  ]

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-blue-100 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Products Display Component
const ProductsDisplay = ({ title, icon: Icon, description, products, seeMoreLink, loading }) => {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
          {seeMoreLink && (
            <Button variant="ghost" className="gap-1" href={seeMoreLink}>
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Main Home Component
const BuyerHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [trendingProducts, setTrendingProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [homeTopBanners, setHomeTopBanners] = useState([])
  const [homeMiddleBanners, setHomeMiddleBanners] = useState([])
  const [homeBottomBanners, setHomeBottomBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Fetching home data with sequential requests...')

      // Fetch data sequentially with delays to avoid rate limiting
      const tasks = [
        // 1. Fetch all banners
        async () => {
          console.log('Fetching banners...')
          try {
            const response = await bannerService.getActiveAds()
            const allBanners = response.data || []
            setBanners(allBanners)

            // Filter banners by position
            setHomeTopBanners(allBanners.filter(b => b.position === 'HOME_TOP'))
            setHomeMiddleBanners(allBanners.filter(b => b.position === 'HOME_MIDDLE'))
            setHomeBottomBanners(allBanners.filter(b => b.position === 'HOME_BOTTOM'))

            console.log('Banners loaded:', {
              total: allBanners.length,
              homeTop: allBanners.filter(b => b.position === 'HOME_TOP').length,
              homeMiddle: allBanners.filter(b => b.position === 'HOME_MIDDLE').length,
              homeBottom: allBanners.filter(b => b.position === 'HOME_BOTTOM').length
            })

            return response
          } catch (bannerError) {
            console.error('Failed to fetch banners:', bannerError)
            // Set empty banners and continue
            setBanners([])
            setHomeTopBanners([])
            setHomeMiddleBanners([])
            setHomeBottomBanners([])
          }
        },

        // 2. Wait 500ms
        async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
        },

        // 3. Fetch featured products
        async () => {
          console.log('Fetching featured products...')
          const response = await productService.getFeaturedProducts(12)
          setFeaturedProducts(response.data?.products || [])
          return response
        },

        // 4. Wait 800ms
        async () => {
          await new Promise(resolve => setTimeout(resolve, 800))
        },

        // 5. Fetch categories
        async () => {
          console.log('Fetching categories...')
          const response = await categoryService.getFeaturedCategories()
          setCategories(response.data || [])
          return response
        },

        // 6. Wait 800ms
        async () => {
          await new Promise(resolve => setTimeout(resolve, 800))
        },

        // 7. Fetch new arrivals
        async () => {
          console.log('Fetching new arrivals...')
          const response = await productService.getNewArrivals(8)
          setNewArrivals(response.data?.products || [])
          return response
        },

        // 8. Wait 600ms
        async () => {
          await new Promise(resolve => setTimeout(resolve, 600))
        },

        // 9. Fetch best sellers
        async () => {
          console.log('Fetching best sellers...')
          const response = await productService.getBestSellers(8)
          setBestSellers(response.data?.products || [])
          return response
        },

        // 10. Wait 600ms
        async () => {
          await new Promise(resolve => setTimeout(resolve, 600))
        },

        // 11. Fetch trending products
        async () => {
          console.log('Fetching trending products...')
          const response = await productService.getTrendingProducts(8)
          setTrendingProducts(response.data?.products || [])
          return response
        }
      ]

      // Execute tasks sequentially
      for (let i = 0; i < tasks.length; i++) {
        try {
          await tasks[i]()
        } catch (taskError) {
          console.error(`Task ${i + 1} failed:`, taskError.message)
          // Continue with other tasks even if one fails
        }
      }

      console.log('✅ Home data loaded successfully')
      console.log({
        banners: banners.length,
        homeTopBanners: homeTopBanners.length,
        homeMiddleBanners: homeMiddleBanners.length,
        homeBottomBanners: homeBottomBanners.length,
        featured: featuredProducts.length,
        categories: categories.length,
        newArrivals: newArrivals.length,
        bestSellers: bestSellers.length,
        trending: trendingProducts.length
      })

    } catch (error) {
      console.error('❌ Failed to fetch home data:', error)
      setError('Failed to load data. Please try again.')

      // Set minimal data for fallback
      setBanners([])
      setHomeTopBanners([])
      setHomeMiddleBanners([])
      setHomeBottomBanners([])
      setFeaturedProducts([])
      setCategories([])
      setNewArrivals([])
      setBestSellers([])
      setTrendingProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Create deals data from featured products with discounts
  const deals = featuredProducts.map(product => ({
    ...product,
    comparePrice: product.comparePrice || Math.round(product.price * (1 + Math.random() * 0.5))
  }))

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="font-bold text-gray-900">JEIEN</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                Home
              </Link>
              <Link
                to="/category/all"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shirt className="h-5 w-5" />
                Categories
              </Link>
              <Link
                to="/search?deals=true"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Percent className="h-5 w-5" />
                Deals
              </Link>
              <Link
                to="/search?featured=true"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Flame className="h-5 w-5" />
                Featured
              </Link>
              <Link
                to="/search?sort=newest"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Zap className="h-5 w-5" />
                New Arrivals
              </Link>
            </div>

            {/* Divider */}
            <div className="px-4 py-2">
              <div className="border-t"></div>
            </div>

            {/* Auth Section */}
            <div className="p-4 space-y-1">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase">Account</span>
              </div>

              {/* Login Button */}
              <Link
                to="/login"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                Login
              </Link>

              {/* Signup Button */}
              <Link
                to="/register"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserPlus className="h-5 w-5" />
                Sign Up
              </Link>

              {/* Vendor Registration */}
              <Link
                to="/register?vendor=true"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Become a Vendor
              </Link>
            </div>

            {/* Divider */}
            <div className="px-4 py-2">
              <div className="border-t"></div>
            </div>

            {/* Additional Links */}
            <div className="p-4 space-y-1">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase">Help & Support</span>
              </div>
              <Link
                to="/help"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="h-5 w-5" />
                Help Center
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="h-5 w-5" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchHomeData} loading={loading}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Mobile Navigation Loading */}
        <nav className="sticky top-0 z-40 bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </nav>

        {/* Hero Banner Loading */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto py-8 px-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-[320px] lg:h-[400px] rounded-2xl bg-gray-200 animate-pulse"></div>
              <div className="flex flex-col gap-4">
                <div className="h-[154px] rounded-2xl bg-gray-200 animate-pulse"></div>
                <div className="h-[154px] rounded-2xl bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Loading */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-20 rounded-2xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Loading */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {[...Array(14)].map((_, idx) => (
                <div key={idx} className="h-32 rounded-2xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Hero Banner - HOME_TOP position */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto py-8 px-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 min-h-[320px] lg:min-h-[400px]"
            >
              {homeTopBanners.length > 0 ? (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={homeTopBanners[0].image}
                      alt={homeTopBanners[0].title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-center p-8 lg:p-12">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium w-fit mb-4"
                    >
                      <Sparkles className="h-4 w-4" />
                      {homeTopBanners[0].label || 'Limited Time Offer'}
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl lg:text-5xl font-bold text-white mb-4"
                    >
                      {homeTopBanners[0].title}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/80 text-lg mb-6 max-w-md"
                    >
                      {homeTopBanners[0].description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <Button size="lg" className="gap-2 shadow-lg" href={homeTopBanners[0].link || '/search'}>
                        Shop Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="relative z-10 h-full flex flex-col justify-center p-8 lg:p-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-gray-900 text-sm font-medium w-fit mb-4"
                  >
                    <Sparkles className="h-4 w-4" />
                    Welcome to JEIEN
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4"
                  >
                    Discover Premium<br />
                    <span className="text-blue-700">Products</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-lg mb-6 max-w-md"
                  >
                    Shop from thousands of trusted vendors. Quality products at unbeatable prices.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <Button size="lg" className="gap-2 shadow-lg" href="/search">
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/50 backdrop-blur-sm" href="/search?deals=true">
                      View Deals
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Side Banners */}
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 p-6 relative"
              >
                <div className="relative z-10">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">New Arrivals</span>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900">Fresh Products</h3>
                  <p className="text-sm text-gray-600 mb-4">New items added daily</p>
                  <Button variant="secondary" size="sm" className="gap-1" href="/search?sort=newest">
                    Explore <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white relative"
              >
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Flash Sale</span>
                  <h3 className="text-xl font-bold mt-2 mb-1">
                    20% OFF
                  </h3>
                  <p className="text-sm opacity-90 mb-4">On selected categories</p>
                  <Button variant="secondary" size="sm" className="gap-1 bg-white text-gray-900 hover:bg-white/90" href="/search?deals=flash">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Categories */}
      <CategorySection categories={categories} loading={loading && categories.length === 0} />

      {/* New Arrivals */}
      <ProductsDisplay
        title="New Arrivals"
        icon={Zap}
        description="Check out our latest products"
        products={newArrivals}
        seeMoreLink="/search?sort=newest"
        loading={loading && newArrivals.length === 0}
      />

      {/* Deals */}
      <DealsSection deals={deals} loading={loading && featuredProducts.length === 0} />

      {/* Featured Products - HOME_MIDDLE position banners before */}
      {homeMiddleBanners.length > 0 && (
        <PromoBanner banners={homeMiddleBanners} loading={loading && banners.length === 0} position="HOME_MIDDLE" />
      )}

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} loading={loading && featuredProducts.length === 0} />

      {/* Best Sellers */}
      <ProductsDisplay
        title="Best Sellers"
        icon={TrendingUp}
        description="Most popular products this week"
        products={bestSellers}
        seeMoreLink="/search?sort=popular"
        loading={loading && bestSellers.length === 0}
      />

      {/* HOME_BOTTOM position banners */}
      {homeBottomBanners.length > 0 && (
        <PromoBanner banners={homeBottomBanners} loading={loading && banners.length === 0} position="HOME_BOTTOM" />
      )}

      {/* Trending Products */}
      <ProductsDisplay
        title="Trending Now"
        icon={Flame}
        description="What everyone is buying"
        products={trendingProducts}
        seeMoreLink="/search?sort=trending"
        loading={loading && trendingProducts.length === 0}
      />

      {/* CTA Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 to-blue-800 p-8 lg:p-12 text-white"
          >
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Become a Vendor Today
              </h3>
              <p className="text-gray-300 mb-6">
                Join thousands of sellers and reach millions of customers. Start your business with zero upfront costs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800" href="/register?vendor=true">
                  Start Selling <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" href="/vendor-info">
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default BuyerHome