import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../../services/product.service'
import { debounce } from 'lodash'

const AdminProducts = () => {
  const navigate = useNavigate()
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

  const debouncedFetchProducts = useCallback(
    debounce(async (searchValue, filterValues) => {
      try {
        setIsSearching(true)
        const params = new URLSearchParams()
        
        if (searchValue) params.append('search', searchValue)
        if (filterValues.category) params.append('category', filterValues.category)
        if (filterValues.approved !== '') params.append('approved', filterValues.approved)
        if (filterValues.published !== '') params.append('published', filterValues.published)
        params.append('admin', 'true')
        
        console.log('Fetching products with params:', Object.fromEntries(params))
        
        const response = await productService.getAllProducts(`?${params.toString()}`)
        console.log('Products found:', response.data.products?.length)
        
        setProducts(response.data.products || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        if (error.response?.status === 429) {
          console.warn('Rate limited. Please wait...')
          setTimeout(() => debouncedFetchProducts(searchValue, filterValues), 1000)
        } else if (error.response?.status !== 429) {
          alert('Failed to load products. Please check console for details.')
        }
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        const response = await productService.getAllProducts('?admin=true&limit=100')
        setProducts(response.data.products || [])
      } catch (error) {
        console.error('Initial fetch failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initialFetch()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!loading) {
      debouncedFetchProducts(searchTerm, filters)
    }
  }, [filters, searchTerm, debouncedFetchProducts, loading])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const token = localStorage.getItem('token')
      const response = await fetch('https://jeien-backend.onrender.com/api/categories', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 429) {
        console.warn('Rate limited for categories. Retrying...')
        setTimeout(fetchCategories, 2000)
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      if (!error.toString().includes('429')) {
        setTimeout(fetchCategories, 3000)
      }
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    setSearchTerm(value)
  }

  const handleApprove = async (productId) => {
    try {
      await productService.updateProduct(productId, { approved: true })
      alert('Product approved successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Failed to approve product:', error)
      alert('Failed to approve product: ' + error.message)
    }
  }

  const handlePublishToggle = async (productId, currentStatus) => {
    try {
      await productService.updateProduct(productId, { published: !currentStatus })
      alert(`Product ${!currentStatus ? 'published' : 'unpublished'} successfully!`)
      fetchProducts()
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
      alert('Failed to update product: ' + error.message)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productService.deleteProduct(productId)
        alert('Product deleted successfully!')
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
        alert('Failed to delete product: ' + error.message)
      }
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.approved !== '') params.append('approved', filters.approved)
      if (filters.published !== '') params.append('published', filters.published)
      if (searchTerm) params.append('search', searchTerm)
      params.append('admin', 'true')
      
      const response = await productService.getAllProducts(`?${params.toString()}`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      if (error.response?.status !== 429) {
        alert('Failed to load products.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('ADMIN: SUBMIT HANDLER TRIGGERED')
    
    const requiredFields = ['title', 'price', 'category']
    const missingFields = requiredFields.filter(field => !newProduct[field])
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!selectedImages || selectedImages.length === 0) {
      alert('Please select at least one image')
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
      
      if (newProduct.sku && newProduct.sku.trim()) {
        formDataToSend.append('sku', newProduct.sku.trim().toUpperCase())
      }
      
      console.log('Appending images:', selectedImages.length)
      selectedImages.forEach((imageFile, index) => {
        if (imageFile instanceof File) {
          formDataToSend.append('images', imageFile)
          console.log(`Appended image ${index}: ${imageFile.name}`)
        } else {
          console.error(`Image ${index} is not a File object:`, imageFile)
        }
      })
      
      console.log('=== FormData being sent ===')
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }
      
      console.log('Calling productService.createProduct...')
      const response = await productService.createProduct(formDataToSend)
      
      console.log('Product created successfully:', response)
      alert(`Product created successfully! ${response.message}`)
      
      resetForm()
      setShowAddModal(false)
      fetchProducts()
      
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===', error)
      
      if (error.response?.data) {
        console.error('Error response data:', error.response.data)
        
        if (error.response.data.message) {
          alert(`Error: ${error.response.data.message}`)
        }
        
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).join('\n')
          alert(`Validation errors:\n${errorMessages}`)
        }
      } else if (error.message) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Failed to create product. Please try again.')
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    console.log('Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
    setSelectedImages(files)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`${name} changed`, value)
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Product
          </button>
          <button
            onClick={() => navigate('/vendor/products')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Vendor Portal
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

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newProduct.title}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleImageChange}
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
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
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KES {product.price?.toLocaleString() || '0'}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          KES {product.comparePrice.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.vendor?.storeName || 'Unknown Vendor'}
                      </div>
                      {product.vendor?.verified && (
                        <span className="text-xs text-green-600">✓ Verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          product.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.approved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          product.published
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.published ? '🌐 Published' : '📦 Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            title="View Product"
                          >
                            👁 View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            title="Edit Product"
                          >
                            ✏ Edit
                          </button>
                        </div>
                        <div className="flex gap-1">
                          {!product.approved && (
                            <button
                              onClick={() => handleApprove(product._id)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Approve Product"
                            >
                              ✓ Approve
                            </button>
                          )}
                          <button
                            onClick={() => handlePublishToggle(product._id, product.published)}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            title={product.published ? 'Unpublish' : 'Publish'}
                          >
                            {product.published ? '📦 Unpublish' : '🌐 Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Delete Product"
                          >
                            🗑 Delete
                          </button>
                        </div>
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

export default AdminProducts