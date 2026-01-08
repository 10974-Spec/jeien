import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import productService from '../../services/product.service'
import { debounce } from 'lodash'
import { 
  Edit, Trash2, Eye, CheckCircle, XCircle, 
  ExternalLink, AlertCircle, Package, EyeOff, Eye as EyeOpen,
  ArrowLeft, Save, X, Upload, Tag, DollarSign, Hash, Image as ImageIcon,
  Plus, Minus
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const AdminProducts = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.includes('/admin/products/edit/')
  const [mode, setMode] = useState(isEditMode ? 'edit' : 'list')
  
  // List View State
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    approved: '',
    published: '',
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  
  // Edit View State
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    comparePrice: '',
    discount: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    specifications: [],
    tags: '',
    metaTitle: '',
    metaDescription: '',
    published: true,
    approved: true
  })
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [errors, setErrors] = useState({})
  const [editLoading, setEditLoading] = useState(true)

  // Toast notification functions
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    })
  }

  const showError = (message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    })
  }

  const showInfo = (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    })
  }

  const debouncedFetchProducts = useCallback(
    debounce(async (searchValue, filterValues) => {
      try {
        setIsSearching(true)
        
        const params = {
          admin: 'true'
        }
        
        if (searchValue) params.search = searchValue
        if (filterValues.category) params.category = filterValues.category
        if (filterValues.approved !== '') params.approved = filterValues.approved
        if (filterValues.published !== '') params.published = filterValues.published
        
        const response = await productService.getAllProducts(params)
        setProducts(response.data.products || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        showError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    // Update mode based on URL
    const newIsEditMode = location.pathname.includes('/admin/products/edit/')
    setMode(newIsEditMode ? 'edit' : 'list')
    
    if (newIsEditMode && id) {
      fetchEditProduct()
    } else {
      fetchProducts()
    }
    
    fetchCategories()
  }, [location.pathname, id])

  useEffect(() => {
    if (!loading && mode === 'list') {
      debouncedFetchProducts(searchTerm, filters)
    }
  }, [filters, searchTerm, debouncedFetchProducts, loading, mode])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://jeien-backend.onrender.com/api'}/categories`, {
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || data.data?.categories || [])
      } else {
        console.error('Failed to fetch categories:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const params = {
        admin: 'true'
      }
      
      if (filters.category) params.category = filters.category
      if (filters.approved !== '') params.approved = filters.approved
      if (filters.published !== '') params.published = filters.published
      if (searchTerm) params.search = searchTerm
      
      const response = await productService.getAllProducts(params)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEditProduct = async () => {
    if (!id) {
      console.error('No product ID provided for editing')
      showError('No product ID provided. Please select a product to edit.')
      setEditLoading(false)
      return
    }
    
    try {
      setEditLoading(true)
      console.log('Fetching product with ID:', id)
      
      const response = await productService.getProductById(id)
      console.log('Product data received:', response.data)
      
      const productData = response.data.product || response.data
      
      setEditingProduct(productData)
      setExistingImages(productData.images || [])
      
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || '',
        stock: productData.stock || '',
        category: productData.category?._id || productData.category || '',
        sku: productData.sku || '',
        comparePrice: productData.comparePrice || '',
        discount: productData.discount || '',
        weight: productData.weight || '',
        dimensions: {
          length: productData.dimensions?.length || '',
          width: productData.dimensions?.width || '',
          height: productData.dimensions?.height || ''
        },
        specifications: productData.specifications || [],
        tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : '',
        metaTitle: productData.seo?.title || productData.metaTitle || '',
        metaDescription: productData.seo?.description || productData.metaDescription || '',
        published: productData.published !== false,
        approved: productData.approved !== false
      })
      
      console.log('Form data set:', {
        ...formData,
        category: productData.category?._id || productData.category
      })
      
    } catch (error) {
      console.error('Failed to fetch product:', error)
      showError('Failed to load product. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    setSearchTerm(value)
  }

  const handleApprove = async (productId, currentStatus) => {
    if (actionLoading[productId]) return
    
    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }))
      
      const newStatus = !currentStatus
      await productService.updateProduct(productId, { approved: newStatus })
      
      showSuccess(`Product ${newStatus ? 'approved' : 'unapproved'} successfully!`)
      
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, approved: newStatus }
          : product
      ))
      
    } catch (error) {
      console.error('Failed to update approval status:', error)
      showError(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handlePublishToggle = async (productId, currentStatus) => {
    if (actionLoading[productId]) return
    
    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }))
      
      const newStatus = !currentStatus
      await productService.updateProduct(productId, { published: newStatus })
      
      showSuccess(`Product ${newStatus ? 'published' : 'unpublished'} successfully!`)
      
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, published: newStatus }
          : product
      ))
      
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
      showError(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedProduct._id]: true }))
      
      await productService.deleteProduct(selectedProduct._id)
      
      showSuccess('Product deleted successfully!')
      
      setProducts(prev => prev.filter(product => product._id !== selectedProduct._id))
      setShowDeleteConfirm(false)
      setSelectedProduct(null)
      
    } catch (error) {
      console.error('Failed to delete product:', error)
      showError(`Failed to delete product: ${error.response?.data?.message || error.message}`)
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedProduct._id]: false }))
    }
  }

  const handleViewProduct = (productId) => {
    window.open(`/product/${productId}`, '_blank')
  }

  const handleEditProduct = (productId) => {
    console.log('Navigating to edit product:', productId)
    navigate(`/admin/products/edit/${productId}`)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    
    const requiredFields = ['title', 'price', 'category']
    const missingFields = requiredFields.filter(field => !newProduct[field])
    
    if (missingFields.length > 0) {
      showError(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!selectedImages || selectedImages.length === 0) {
      showError('Please select at least one image')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const formDataToSend = new FormData()
      
      formDataToSend.append('title', newProduct.title.trim())
      formDataToSend.append('description', (newProduct.description || '').trim())
      formDataToSend.append('price', newProduct.price.toString())
      formDataToSend.append('stock', newProduct.stock ? newProduct.stock.toString() : '0')
      formDataToSend.append('category', newProduct.category)
      formDataToSend.append('published', 'true')
      formDataToSend.append('approved', 'true')
      
      if (newProduct.sku && newProduct.sku.trim()) {
        formDataToSend.append('sku', newProduct.sku.trim().toUpperCase())
      }
      
      selectedImages.forEach((imageFile) => {
        if (imageFile instanceof File) {
          formDataToSend.append('images', imageFile)
        }
      })
      
      const response = await productService.createProduct(formDataToSend)
      
      showSuccess('Product created successfully!')
      
      resetForm()
      setShowAddModal(false)
      fetchProducts()
      
    } catch (error) {
      console.error('Product creation error:', error)
      
      if (error.response?.data) {
        if (error.response.data.message) {
          showError(`Error: ${error.response.data.message}`)
        }
        
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).join('\n')
          showError(`Validation errors:\n${errorMessages}`)
        }
      } else if (error.message) {
        showError(`Error: ${error.message}`)
      } else {
        showError('Failed to create product. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewProduct({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      sku: '',
    })
    setSelectedImages([])
  }

  const handleAddImageChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)
  }

  const handleAddInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Edit Form Functions
  const validateEditForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.stock && parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative'
    
    // Validate comparePrice is a valid number if provided
    if (formData.comparePrice && formData.comparePrice.trim() !== '') {
      if (isNaN(parseFloat(formData.comparePrice)) || parseFloat(formData.comparePrice) < 0) {
        newErrors.comparePrice = 'Compare price must be a valid number'
      }
    }
    
    setErrors(newErrors)
    
    // Show validation errors as toasts
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        showError(error)
      })
      return false
    }
    
    return true
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }))
      }
    }
  }

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])
  }

  const removeEditExistingImage = (imageUrl) => {
    setImagesToRemove(prev => [...prev, imageUrl])
    setExistingImages(prev => prev.filter(img => img !== imageUrl))
    showInfo('Image marked for removal')
  }

  const removeEditNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    showInfo('Image removed')
  }

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))
  }

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }))
  }

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
    showInfo('Specification removed')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEditForm()) {
      return
    }
    
    try {
      setSaving(true)
      
      const formDataToSend = new FormData()
      
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('stock', formData.stock ? formData.stock.toString() : '0')
      formDataToSend.append('category', formData.category)
      formDataToSend.append('published', formData.published.toString())
      formDataToSend.append('approved', formData.approved.toString())
      
      if (formData.sku.trim()) formDataToSend.append('sku', formData.sku.trim().toUpperCase())
      
      // Validate and append comparePrice
      if (formData.comparePrice && formData.comparePrice.trim() !== '') {
        const comparePriceValue = parseFloat(formData.comparePrice)
        if (!isNaN(comparePriceValue) && comparePriceValue >= 0) {
          formDataToSend.append('comparePrice', comparePriceValue.toString())
        }
      }
      
      if (formData.discount) {
        const discountValue = parseFloat(formData.discount)
        if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
          formDataToSend.append('discount', discountValue.toString())
        }
      }
      
      if (formData.weight) {
        const weightValue = parseFloat(formData.weight)
        if (!isNaN(weightValue) && weightValue >= 0) {
          formDataToSend.append('weight', weightValue.toString())
        }
      }
      
      const dimensions = {}
      if (formData.dimensions.length) {
        const lengthValue = parseFloat(formData.dimensions.length)
        if (!isNaN(lengthValue) && lengthValue >= 0) dimensions.length = lengthValue.toString()
      }
      if (formData.dimensions.width) {
        const widthValue = parseFloat(formData.dimensions.width)
        if (!isNaN(widthValue) && widthValue >= 0) dimensions.width = widthValue.toString()
      }
      if (formData.dimensions.height) {
        const heightValue = parseFloat(formData.dimensions.height)
        if (!isNaN(heightValue) && heightValue >= 0) dimensions.height = heightValue.toString()
      }
      
      if (Object.keys(dimensions).length > 0) {
        formDataToSend.append('dimensions', JSON.stringify(dimensions))
      }
      
      if (formData.specifications.length > 0) {
        const validSpecs = formData.specifications.filter(spec => spec.key.trim() && spec.value.trim())
        if (validSpecs.length > 0) {
          formDataToSend.append('specifications', JSON.stringify(validSpecs))
        }
      }
      
      if (formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        formDataToSend.append('tags', JSON.stringify(tagsArray))
      }
      
      const seoData = {}
      if (formData.metaTitle.trim()) seoData.title = formData.metaTitle.trim()
      if (formData.metaDescription.trim()) seoData.description = formData.metaDescription.trim()
      
      if (Object.keys(seoData).length > 0) {
        formDataToSend.append('seo', JSON.stringify(seoData))
      }
      
      if (imagesToRemove.length > 0) {
        formDataToSend.append('removeImages', JSON.stringify(imagesToRemove))
      }
      
      newImages.forEach(imageFile => {
        if (imageFile instanceof File) {
          formDataToSend.append('images', imageFile)
        }
      })
      
      const response = await productService.updateProduct(id, formDataToSend)
      
      showSuccess('Product updated successfully!')
      
      setTimeout(() => {
        fetchEditProduct()
        setNewImages([])
        setImagesToRemove([])
      }, 1000)
      
    } catch (error) {
      console.error('Update error:', error)
      
      // Parse and show detailed error messages
      if (error.response?.data) {
        if (error.response.data.message) {
          showError(`Error: ${error.response.data.message}`)
        }
        
        if (error.response.data.errors) {
          // Handle validation errors from server
          Object.entries(error.response.data.errors).forEach(([field, message]) => {
            showError(`${field}: ${message}`)
          })
        }
      } else if (error.message) {
        showError(`Error: ${error.message}`)
      } else {
        showError('Failed to update product. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KES 0'
    return `KES ${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Edit View Component
  const renderEditView = () => {
    if (editLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      )
    }

    if (!editingProduct) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're trying to edit doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Products
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </button>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600">Update product information and images</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Product Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleEditSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., PROD-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (KES) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        KES
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleEditInputChange}
                        className={`w-full pl-12 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compare Price (KES)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        KES
                      </div>
                      <input
                        type="number"
                        name="comparePrice"
                        value={formData.comparePrice}
                        onChange={handleEditInputChange}
                        className={`w-full pl-12 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.comparePrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.comparePrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.comparePrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="6"
                    placeholder="Describe your product in detail..."
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </h2>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditExistingImage(image)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {newImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">New Images to Upload</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditNewImage(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add More Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Drag & drop images here, or click to browse</p>
                    <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, GIF up to 5MB each</p>
                    <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer inline-block">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                
                <div className="space-y-4">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="e.g., Color, Size, Material"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="e.g., Red, Large, Cotton"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Specification
                  </button>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., electronics, gadget, wireless"
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.5"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions - Length (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions - Width (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions - Height (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="SEO description for search engines"
                    />
                  </div>
                </div>
              </div>

              {/* Status Settings */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Status Settings</h2>
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Published (Visible to customers)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.approved}
                      onChange={(e) => setFormData(prev => ({ ...prev, approved: e.target.checked }))}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Approved (Verified by admin)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // List View Component
  const renderListView = () => {
    return (
      <div className="space-y-6">
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold">Confirm Delete</h2>
              </div>
              
              <p className="mb-4">
                Are you sure you want to delete <strong>"{selectedProduct.title}"</strong>?
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSelectedProduct(null)
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={actionLoading[selectedProduct._id]}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  disabled={actionLoading[selectedProduct._id]}
                >
                  {actionLoading[selectedProduct._id] ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Product</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newProduct.title}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleAddInputChange}
                      className="w-full px-3 py-2 border rounded"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border rounded"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={newProduct.sku}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Images *
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddImageChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {selectedImages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Selected {selectedImages.length} image(s):
                        </p>
                        <ul className="text-sm text-gray-500">
                          {selectedImages.map((img, index) => (
                            <li key={index}>{img.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Add Product
            </button>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Approved</h3>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.approved).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {products.filter(p => !p.approved).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Published</h3>
            <p className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.published).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products by title, description, SKU..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded"
              />
              {(isSearching || loading) && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={filters.approved}
              onChange={(e) => setFilters({ ...filters, approved: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
            <select
              value={filters.published}
              onChange={(e) => setFilters({ ...filters, published: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Published Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2">Try adjusting your filters or add a new product</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price & Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.title}</div>
                            {product.sku && (
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {product.vendor?.storeName || 'Unknown Vendor'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock || 0} in stock
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleApprove(product._id, product.approved)}
                            disabled={actionLoading[product._id]}
                            className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              product.approved 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            } ${actionLoading[product._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {product.approved ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Pending
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handlePublishToggle(product._id, product.published)}
                            disabled={actionLoading[product._id]}
                            className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              product.published
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } ${actionLoading[product._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {product.published ? (
                              <>
                                <EyeOpen className="h-3 w-3" />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Unpublished
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewProduct(product._id)}
                              className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                              title="View Product"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
                              title="Edit Product"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            disabled={actionLoading[product._id]}
                            className="w-full px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1 disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{' '}
                      <span className="font-medium">{products.length}</span> of{' '}
                      <span className="font-medium">{products.length}</span> products
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        disabled
                      >
                        Previous
                      </button>
                      <button
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        disabled
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render based on mode
  return (
    <>
      <Toaster />
      {mode === 'edit' ? renderEditView() : renderListView()}
    </>
  )
}

export default AdminProducts