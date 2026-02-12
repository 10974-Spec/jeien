import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { debounce } from 'lodash'
import {
  Layers, Shield, Globe, Ruler, Scale, Percent, Calendar, Store,
  Check, X as XIcon, MoreVertical, Download, Copy, Star,
  Package, Search, Filter, Plus, Edit, Trash2, Eye, AlertCircle,
  ArrowLeft, Save, X, Image as ImageIcon, Upload, Loader,
  RefreshCw, Tag, Hash, DollarSign, TrendingUp, BarChart3,
  CheckCircle, EyeOff, Eye as EyeOpen
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// ─── Import your API services here ───────────────────────────────────────────
import api from '../../services/api'

// ─── FIXED: Use consistent API methods without manual URL construction ──────
const productService = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateProduct: (id, data) =>
    api.put(`/products/${id}`, data,
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    ),
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

const categoryService = {
  getAllCategories: () => api.get('/categories'),
}
// ─────────────────────────────────────────────────────────────────────────────

const AdminProducts = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isEditMode = location.pathname.includes('/admin/products/edit/')
  const [mode, setMode] = useState(isEditMode ? 'edit' : 'list')

  // ── List state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', approved: '', published: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '', description: '', price: '', stock: '', category: '', sku: '',
    allowWholesale: false, wholesalePrice: '', minWholesaleQuantity: 10,
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', stock: '', category: '', sku: '',
    comparePrice: '', discount: '', weight: '',
    dimensions: { length: '', width: '', height: '' },
    specifications: [], tags: '', metaTitle: '', metaDescription: '',
    published: true, approved: true,
    allowWholesale: false, wholesalePrice: '', minWholesaleQuantity: 10,
  })
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [errors, setErrors] = useState({})
  const [editLoading, setEditLoading] = useState(true)

  // ── Permission check before any product operation ──────────────────────────
  const checkPermissions = () => {
    try {
      return api.ensureProductPermissions()
    } catch (error) {
      showError(error.message)
      navigate('/login')
      return null
    }
  }

  // ── Toast helpers ───────────────────────────────────────────────────────────
  const showSuccess = (message) =>
    toast.success(message, {
      duration: 4000, position: 'top-right',
      style: { background: '#10B981', color: '#fff' },
      icon: <Check className="h-5 w-5" />,
    })

  const showError = (message) =>
    toast.error(message, {
      duration: 5000, position: 'top-right',
      style: { background: '#EF4444', color: '#fff' },
      icon: <XIcon className="h-5 w-5" />,
    })

  const showInfo = (message) =>
    toast(message, {
      duration: 3000, position: 'top-right',
      style: { background: '#3B82F6', color: '#fff' },
      icon: <AlertCircle className="h-5 w-5" />,
    })

  // ── Debounced search ────────────────────────────────────────────────────────
  const debouncedFetchProducts = useCallback(
    debounce(async (searchValue, filterValues) => {
      try {
        setIsSearching(true)
        const params = { admin: 'true' }
        if (searchValue) params.search = searchValue
        if (filterValues.category) params.category = filterValues.category
        if (filterValues.approved !== '') params.approved = filterValues.approved
        if (filterValues.published !== '') params.published = filterValues.published

        const response = await productService.getAllProducts(params)
        setProducts(response.data.products || response.data || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        if (error.response?.status === 403) {
          showError('Permission denied. Please log in with vendor/admin account.')
          navigate('/login')
        } else {
          showError('Failed to load products. Please try again.')
        }
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }, 500),
    [navigate]
  )

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
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

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await categoryService.getAllCategories()

      // Handle different response formats
      let categoriesData = []
      if (response.data.categories) {
        categoriesData = response.data.categories
      } else if (response.data.data?.categories) {
        categoriesData = response.data.data.categories
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data
      } else if (response.data && typeof response.data === 'object') {
        categoriesData = [response.data]
      }

      setCategories(categoriesData)
    } catch (error) {
      console.error('Error in fetchCategories:', error)
      if (error.response?.status !== 403) {
        showError('Failed to load categories.')
      }
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = { admin: 'true' }
      if (filters.category) params.category = filters.category
      if (filters.approved !== '') params.approved = filters.approved
      if (filters.published !== '') params.published = filters.published
      if (searchTerm) params.search = searchTerm

      const response = await productService.getAllProducts(params)
      setProducts(response.data.products || response.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      if (error.response?.status === 403) {
        showError('Permission denied. Please log in with vendor/admin account.')
        navigate('/login')
      } else {
        showError('Failed to load products. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchEditProduct = async () => {
    if (!id) {
      showError('No product ID provided.')
      setEditLoading(false)
      return
    }

    const auth = checkPermissions()
    if (!auth) return

    try {
      setEditLoading(true)
      const response = await productService.getProductById(id)
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
          height: productData.dimensions?.height || '',
        },
        specifications: productData.specifications || [],
        tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : '',
        metaTitle: productData.seo?.title || productData.metaTitle || '',
        metaDescription: productData.seo?.description || productData.metaDescription || '',
        published: productData.published !== false,
        approved: productData.approved !== false,
        allowWholesale: productData.allowWholesale || false,
        wholesalePrice: productData.wholesalePrice || '',
        minWholesaleQuantity: productData.minWholesaleQuantity || 10,
      })
    } catch (error) {
      console.error('Failed to fetch product:', error)
      if (error.response?.status === 403) {
        showError('Permission denied. You cannot edit this product.')
      } else if (error.response?.status === 404) {
        showError('Product not found.')
      } else {
        showError('Failed to load product. Please try again.')
      }
    } finally {
      setEditLoading(false)
    }
  }

  // ── Handlers – list view ─────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    setSearchTerm(value)
  }

  const handleApprove = async (productId, currentStatus) => {
    const auth = checkPermissions()
    if (!auth) return
    if (actionLoading[productId]) return

    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }))
      const newStatus = !currentStatus
      await productService.updateProduct(productId, { approved: newStatus })
      showSuccess(`Product ${newStatus ? 'approved' : 'unapproved'} successfully!`)
      setProducts(prev =>
        prev.map(p => p._id === productId ? { ...p, approved: newStatus } : p)
      )
    } catch (error) {
      showError(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handlePublishToggle = async (productId, currentStatus) => {
    const auth = checkPermissions()
    if (!auth) return
    if (actionLoading[productId]) return

    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }))
      const newStatus = !currentStatus
      await productService.updateProduct(productId, { published: newStatus })
      showSuccess(`Product ${newStatus ? 'published' : 'unpublished'} successfully!`)
      setProducts(prev =>
        prev.map(p => p._id === productId ? { ...p, published: newStatus } : p)
      )
    } catch (error) {
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
    const auth = checkPermissions()
    if (!auth || !selectedProduct) return

    try {
      setActionLoading(prev => ({ ...prev, [selectedProduct._id]: true }))
      await productService.deleteProduct(selectedProduct._id)
      showSuccess('Product deleted successfully!')
      setProducts(prev => prev.filter(p => p._id !== selectedProduct._id))
      setShowDeleteConfirm(false)
      setSelectedProduct(null)
    } catch (error) {
      showError(`Failed to delete product: ${error.response?.data?.message || error.message}`)
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedProduct._id]: false }))
    }
  }

  const handleViewProduct = (productId) => window.open(`/product/${productId}`, '_blank')
  const handleEditProduct = (productId) => navigate(`/admin/products/edit/${productId}`)

  // ── Handlers – add modal ─────────────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault()

    const auth = checkPermissions()
    if (!auth) return

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
      const fd = new FormData()
      fd.append('title', newProduct.title.trim())
      fd.append('description', (newProduct.description || '').trim())
      fd.append('price', newProduct.price.toString())
      fd.append('stock', newProduct.stock ? newProduct.stock.toString() : '0')
      fd.append('category', newProduct.category)
      fd.append('published', 'true')
      fd.append('approved', 'true')
      fd.append('allowWholesale', newProduct.allowWholesale ? 'true' : 'false')
      if (newProduct.allowWholesale) {
        if (newProduct.wholesalePrice) fd.append('wholesalePrice', newProduct.wholesalePrice.toString())
        if (newProduct.minWholesaleQuantity) fd.append('minWholesaleQuantity', newProduct.minWholesaleQuantity.toString())
      }
      if (newProduct.sku?.trim()) fd.append('sku', newProduct.sku.trim().toUpperCase())
      selectedImages.forEach(file => { if (file instanceof File) fd.append('images', file) })

      await productService.createProduct(fd)
      showSuccess('Product created successfully!')
      resetForm()
      setShowAddModal(false)
      fetchProducts()
    } catch (error) {
      console.error('Create product error:', error)

      if (error.response?.status === 403) {
        showError('Permission denied. You need vendor/admin privileges.')
      } else if (error.response?.status === 400) {
        const d = error.response.data
        if (d.message === 'Category not found') {
          showError('Category not found. Please create it first.')
        } else if (d.message) {
          showError(`Error: ${d.message}`)
        } else if (d.errors) {
          showError(`Validation errors: ${Object.values(d.errors).join(', ')}`)
        } else {
          showError('Failed to create product. Please check all required fields.')
        }
      } else {
        showError(error.message || 'Failed to create product. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewProduct({
      title: '', description: '', price: '', stock: '', category: '', sku: '',
      allowWholesale: false, wholesalePrice: '', minWholesaleQuantity: 10
    })
    setSelectedImages([])
  }

  const handleAddImageChange = (e) => setSelectedImages(Array.from(e.target.files))

  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ── Handlers – edit form ─────────────────────────────────────────────────────
  const validateEditForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.stock && parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative'
    if (formData.comparePrice && formData.comparePrice.trim() !== '') {
      if (isNaN(parseFloat(formData.comparePrice)) || parseFloat(formData.comparePrice) < 0) {
        newErrors.comparePrice = 'Compare price must be a valid number'
      }
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(err => showError(err))
      return false
    }
    return true
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleEditImageUpload = (e) => setNewImages(prev => [...prev, ...Array.from(e.target.files)])

  const removeEditExistingImage = (imageUrl) => {
    setImagesToRemove(prev => [...prev, imageUrl])
    setExistingImages(prev => prev.filter(img => img !== imageUrl))
    showInfo('Image marked for removal')
  }

  const removeEditNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    showInfo('Image removed')
  }

  const addSpecification = () =>
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))

  const updateSpecification = (index, field, value) =>
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }))

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
    showInfo('Specification removed')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    const auth = checkPermissions()
    if (!auth) return

    if (!validateEditForm()) return

    try {
      setSaving(true)
      const fd = new FormData()

      // Basic fields
      fd.append('title', formData.title.trim())
      fd.append('description', formData.description.trim())
      fd.append('price', formData.price.toString())
      fd.append('stock', formData.stock ? formData.stock.toString() : '0')
      fd.append('category', formData.category)
      fd.append('published', formData.published.toString())
      fd.append('approved', formData.approved.toString())

      if (formData.sku.trim()) fd.append('sku', formData.sku.trim().toUpperCase())

      // Wholesale fields
      fd.append('allowWholesale', formData.allowWholesale.toString())
      if (formData.allowWholesale) {
        if (formData.wholesalePrice) fd.append('wholesalePrice', formData.wholesalePrice.toString())
        if (formData.minWholesaleQuantity) fd.append('minWholesaleQuantity', formData.minWholesaleQuantity.toString())
      }

      // Optional numeric fields
      if (formData.comparePrice?.trim()) {
        const v = parseFloat(formData.comparePrice)
        if (!isNaN(v) && v >= 0) fd.append('comparePrice', v.toString())
      }
      if (formData.discount) {
        const v = parseFloat(formData.discount)
        if (!isNaN(v) && v >= 0 && v <= 100) fd.append('discount', v.toString())
      }
      if (formData.weight) {
        const v = parseFloat(formData.weight)
        if (!isNaN(v) && v >= 0) fd.append('weight', v.toString())
      }

      // Dimensions
      const dims = {}
      const dl = parseFloat(formData.dimensions.length)
      const dw = parseFloat(formData.dimensions.width)
      const dh = parseFloat(formData.dimensions.height)
      if (!isNaN(dl) && dl >= 0) dims.length = dl.toString()
      if (!isNaN(dw) && dw >= 0) dims.width = dw.toString()
      if (!isNaN(dh) && dh >= 0) dims.height = dh.toString()
      if (Object.keys(dims).length > 0) fd.append('dimensions', JSON.stringify(dims))

      // Specifications
      const validSpecs = formData.specifications.filter(s => s.key.trim() && s.value.trim())
      if (validSpecs.length > 0) fd.append('specifications', JSON.stringify(validSpecs))

      // Tags
      if (formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        fd.append('tags', JSON.stringify(tagsArray))
      }

      // SEO
      const seo = {}
      if (formData.metaTitle.trim()) seo.title = formData.metaTitle.trim()
      if (formData.metaDescription.trim()) seo.description = formData.metaDescription.trim()
      if (Object.keys(seo).length > 0) fd.append('seo', JSON.stringify(seo))

      // Images
      if (imagesToRemove.length > 0) fd.append('removeImages', JSON.stringify(imagesToRemove))
      newImages.forEach(file => { if (file instanceof File) fd.append('images', file) })

      await productService.updateProduct(id, fd)
      showSuccess('Product updated successfully!')

      // Refresh product data
      setTimeout(() => {
        fetchEditProduct()
        setNewImages([])
        setImagesToRemove([])
      }, 1000)
    } catch (error) {
      console.error('Update product error:', error)

      if (error.response?.status === 403) {
        showError('Permission denied. You cannot edit this product.')
      } else if (error.response?.data?.message) {
        showError(`Error: ${error.response.data.message}`)
      } else if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, msg]) =>
          showError(`${field}: ${msg}`)
        )
      } else {
        showError(error.message || 'Failed to update product. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Formatters ───────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KES 0'
    return `KES ${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })}`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EDIT VIEW (unchanged - keep your existing renderEditView function)
  // ════════════════════════════════════════════════════════════════════════════
  const renderEditView = () => {
    if (editLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading product details...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the product information</p>
          </div>
        </div>
      )
    }

    if (!editingProduct) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're trying to edit doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/products')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Products
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-500" />
                    Edit Product
                  </h1>
                  <p className="text-gray-600 mt-2">Update product information, images, and settings</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/admin/products')}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {saving ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Saving...</>
                    ) : (
                      <><Save className="h-5 w-5" />Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-500">Essential product details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text" name="title" value={formData.title}
                          onChange={handleEditInputChange}
                          className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                          placeholder="Enter product title"
                        />
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{errors.title}
                        </p>
                      )}
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                      <div className="relative">
                        <input
                          type="text" name="sku" value={formData.sku}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="e.g., PROD-001"
                        />
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number" name="price" value={formData.price}
                          onChange={handleEditInputChange}
                          className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                          placeholder="0.00" step="0.01" min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">KES</span>
                      </div>
                      {errors.price && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{errors.price}
                        </p>
                      )}
                    </div>

                    {/* Compare Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Compare Price</label>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number" name="comparePrice" value={formData.comparePrice}
                          onChange={handleEditInputChange}
                          className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.comparePrice ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                          placeholder="0.00" step="0.01" min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">KES</span>
                      </div>
                      {errors.comparePrice && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{errors.comparePrice}
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number" name="stock" value={formData.stock}
                          onChange={handleEditInputChange}
                          className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                          placeholder="0" min="0"
                        />
                      </div>
                      {errors.stock && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{errors.stock}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                        <select
                          name="category" value={formData.category}
                          onChange={handleEditInputChange}
                          className={`w-full px-4 py-3 pl-11 border rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {errors.category && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description" value={formData.description}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows="6" placeholder="Describe your product in detail..."
                    />
                  </div>
                </div>
              </div>

              {/* Wholesale Pricing */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Wholesale Pricing</h2>
                    <p className="text-sm text-gray-500">Configure bulk order pricing</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.allowWholesale ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {formData.allowWholesale
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Percent className="h-5 w-5 text-gray-500" />}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Enable Wholesale Pricing</span>
                        <p className="text-sm text-gray-500">Allow bulk orders at discounted prices</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allowWholesale"
                        checked={formData.allowWholesale}
                        onChange={handleEditInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {formData.allowWholesale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Wholesale Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            name="wholesalePrice"
                            value={formData.wholesalePrice}
                            onChange={handleEditInputChange}
                            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required={formData.allowWholesale}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">KES</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Min. Wholesale Quantity <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            name="minWholesaleQuantity"
                            value={formData.minWholesaleQuantity}
                            onChange={handleEditInputChange}
                            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="10"
                            min="1"
                            required={formData.allowWholesale}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
                    <p className="text-sm text-gray-500">Add product specifications and details</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <input
                        type="text" value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Color, Size, Material"
                      />
                      <input
                        type="text" value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Red, Large, Cotton"
                      />
                      <button type="button" onClick={() => removeSpecification(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addSpecification}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />Add Specification
                  </button>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
                    <p className="text-sm text-gray-500">Upload and manage product images</p>
                  </div>
                </div>

                {existingImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <span>Current Images</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{existingImages.length}</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Product ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-xl border border-gray-200 group-hover:border-blue-300 transition-all"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error'
                            }} />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all flex items-center justify-center">
                            <button type="button" onClick={() => removeEditExistingImage(image)}
                              className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <span>New Images</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">{newImages.length} to upload</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(image)} alt={`New ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-xl border-2 border-dashed border-blue-300" />
                          <button type="button" onClick={() => removeEditNewImage(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">Drag & drop images here</p>
                    <p className="text-sm text-gray-500 mb-6">or click to browse files</p>
                    <label className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-sm hover:shadow-md">
                      <Upload className="h-4 w-4" />Browse Files
                      <input type="file" multiple accept="image/*" onChange={handleEditImageUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, GIF up to 5MB each</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column (sidebar) ── */}
            <div className="space-y-8">

              {/* Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />Product Status
                </h3>
                <div className="space-y-6">
                  {/* Published toggle */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.published ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {formData.published
                          ? <EyeOpen className="h-5 w-5 text-green-600" />
                          : <EyeOff className="h-5 w-5 text-gray-500" />}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Published</span>
                        <p className="text-sm text-gray-500">Visible to customers</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleEditInputChange}
                        className="sr-only" />
                      <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.published ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.published ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                  </label>

                  {/* Approved toggle */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.approved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {formData.approved
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <AlertCircle className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Approved</span>
                        <p className="text-sm text-gray-500">Verified by admin</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="checkbox"
                        name="approved"
                        checked={formData.approved}
                        onChange={handleEditInputChange}
                        className="sr-only" />
                      <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.approved ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.approved ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-500" />Additional Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="number" name="weight" value={formData.weight}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.5" step="0.01" min="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="number" name="discount" value={formData.discount}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0" min="0" max="100" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" name="tags" value={formData.tags}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="electronics, gadget, wireless" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SEO title for search engines" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea name="metaDescription" value={formData.metaDescription}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3" placeholder="SEO description for search engines" />
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Dimensions (cm)</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['length', 'width', 'height'].map(dim => (
                    <div key={dim}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{dim}</label>
                      <input type="number" name={`dimensions.${dim}`} value={formData.dimensions[dim]}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10" step="0.1" min="0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky save */}
              <div className="sticky top-8">
                <button onClick={handleEditSubmit} disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                  {saving ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Saving Changes...</>
                  ) : (
                    <><Save className="h-5 w-5" />Save All Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST VIEW (unchanged - keep your existing renderListView function)
  // ════════════════════════════════════════════════════════════════════════════
  const renderListView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 md:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />Products Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and organize all your products</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <Plus className="h-5 w-5" />Add Product
            </button>
            <button onClick={fetchProducts}
              className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 flex items-center justify-center gap-2">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, color: 'blue', icon: <Package className="h-6 w-6 text-blue-500" /> },
            { label: 'Approved', value: products.filter(p => p.approved).length, color: 'green', icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
            { label: 'Pending', value: products.filter(p => !p.approved).length, color: 'yellow', icon: <AlertCircle className="h-6 w-6 text-yellow-500" /> },
            { label: 'Published', value: products.filter(p => p.published).length, color: 'purple', icon: <EyeOpen className="h-6 w-6 text-purple-500" /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
                </div>
                <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search products by title, description, SKU..."
              value={search} onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            {(isSearching || loading) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Category filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <select value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none transition-all">
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Approval filter */}
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <select value={filters.approved}
                onChange={(e) => setFilters({ ...filters, approved: e.target.value })}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none transition-all">
                <option value="">All Status</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Published filter */}
            <div className="relative">
              <EyeOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <select value={filters.published}
                onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none transition-all">
                <option value="">Published Status</option>
                <option value="true">Published</option>
                <option value="false">Unpublished</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {searchTerm || Object.values(filters).some(f => f)
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchTerm && !Object.values(filters).some(f => f) && (
              <button onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 flex items-center gap-2">
                <Plus className="h-5 w-5" />Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Category', 'Price & Stock', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.title}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
                                }} />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">{product.title}</div>
                            {product.sku && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Hash className="h-3 w-3" />{product.sku}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                              <Store className="h-3 w-3" />{product.vendor?.storeName || 'Unknown Vendor'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                          <Tag className="h-3 w-3 mr-1" />{product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      {/* Price & Stock */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-lg">{formatPrice(product.price)}</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${product.stock > 10 ? 'bg-green-100 text-green-800'
                            : product.stock > 0 ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'}`}>
                          <Layers className="h-3 w-3 mr-1" />{product.stock || 0} in stock
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <button onClick={() => handleApprove(product._id, product.approved)}
                            disabled={actionLoading[product._id]}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${product.approved ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              } ${actionLoading[product._id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {product.approved
                              ? <><CheckCircle className="h-4 w-4 mr-1.5" />Approved</>
                              : <><AlertCircle className="h-4 w-4 mr-1.5" />Pending</>}
                          </button>
                          <button onClick={() => handlePublishToggle(product._id, product.published)}
                            disabled={actionLoading[product._id]}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${product.published ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } ${actionLoading[product._id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {product.published
                              ? <><EyeOpen className="h-4 w-4 mr-1.5" />Published</>
                              : <><EyeOff className="h-4 w-4 mr-1.5" />Unpublished</>}
                          </button>
                        </div>
                      </td>
                      {/* Created */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{formatDate(product.createdAt)}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />Created
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleViewProduct(product._id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleEditProduct(product._id)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(product)}
                            disabled={actionLoading[product._id]}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Delete">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  Showing <span className="font-semibold">{products.length}</span> products
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium" disabled>Previous</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium" disabled>Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong className="text-gray-900">"{selectedProduct.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteConfirm(false); setSelectedProduct(null) }}
                disabled={actionLoading[selectedProduct._id]}
                className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm}
                disabled={actionLoading[selectedProduct._id]}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all disabled:opacity-50">
                {actionLoading[selectedProduct._id] ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Plus className="h-6 w-6 text-blue-500" />Add New Product
              </h2>
              <button onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" value={newProduct.title} onChange={handleAddInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  required placeholder="Enter product title" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea name="description" value={newProduct.description} onChange={handleAddInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  rows="3" placeholder="Describe your product..." />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={newProduct.price} onChange={handleAddInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    step="0.01" min="0" required placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input type="number" name="stock" value={newProduct.stock} onChange={handleAddInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    min="0" placeholder="0" />
                </div>
              </div>

              {/* Wholesale */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Wholesale Pricing</h3>
                    <p className="text-sm text-gray-500">Enable wholesale pricing for bulk orders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="allowWholesale" checked={newProduct.allowWholesale}
                      onChange={(e) => setNewProduct({ ...newProduct, allowWholesale: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {newProduct.allowWholesale && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Wholesale Price <span className="text-red-500">*</span></label>
                      <input type="number" name="wholesalePrice" value={newProduct.wholesalePrice} onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        step="0.01" min="0" required={newProduct.allowWholesale} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Min. Wholesale Qty <span className="text-red-500">*</span></label>
                      <input type="number" name="minWholesaleQuantity" value={newProduct.minWholesaleQuantity} onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        min="1" required={newProduct.allowWholesale} placeholder="10" />
                    </div>
                  </div>
                )}
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <select name="category" value={newProduct.category} onChange={handleAddInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none transition-all" required>
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">If categories don't load, create them first.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                  <input type="text" name="sku" value={newProduct.sku} onChange={handleAddInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Optional SKU" />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Images <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    {selectedImages.length > 0 ? `${selectedImages.length} image(s) selected` : 'Drag & drop images here'}
                  </p>
                  <label className="inline-block cursor-pointer">
                    <span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {selectedImages.length > 0 ? 'Change Images' : 'Browse Files'}
                    </span>
                    <input type="file" multiple accept="image/*" onChange={handleAddImageChange} className="hidden" />
                  </label>
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img src={URL.createObjectURL(img)} alt={`Preview ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg" />
                          <div className="absolute top-1 right-1 w-4 h-4 bg-black bg-opacity-50 text-white text-xs rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting
                    ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Creating...</>
                    : <><Plus className="h-5 w-5" />Create Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Toaster />
      {mode === 'edit' ? renderEditView() : renderListView()}
    </>
  )
}

export default AdminProducts