import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../../services/product.service'
import categoryService from '../../services/category.service'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded">
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-600">Error Details</summary>
            <pre className="mt-2 text-sm bg-white p-4 rounded overflow-auto">
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

const VendorProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugLogs, setDebugLogs] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])

  // Helper to add debug logs
  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = { timestamp, message, data }
    console.log(`[${timestamp}] ${message}`, data || '')
    setDebugLogs(prev => [...prev, logEntry])
  }

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED ===')
    addLog('Component mounted, fetching data...')
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      addLog('Fetching products...')
      setLoading(true)
      const response = await productService.getVendorProducts({})
      addLog('Products fetched successfully', response.data)
      setProducts(response.data.products || [])
    } catch (error) {
      addLog('ERROR fetching products', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      addLog('Fetching categories from API...')
      const response = await categoryService.getAllCategories()
      addLog('Categories fetched successfully', response.data)
      setCategories(response.data.categories || [])
    } catch (error) {
      addLog('ERROR fetching categories', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      console.error('Failed to fetch categories:', error)
      // fallback to empty array to avoid crashing
      setCategories([])
    }
  }

  const handleImageChange = (e) => {
    try {
      addLog('Image input changed')
      const files = Array.from(e.target.files)
      addLog('Files selected', { count: files.length, files: files.map(f => ({ name: f.name, size: f.size, type: f.type })) })
      setSelectedImages(files)
    } catch (error) {
      addLog('ERROR in handleImageChange', { message: error.message, stack: error.stack })
      console.error('Error in handleImageChange:', error)
    }
  }

  const handleSubmit = async (e) => {
    console.log('=== HANDLE SUBMIT CALLED ===')
    console.log('Event:', e)
    console.log('Event type:', e.type)
    
    try {
      addLog('SUBMIT HANDLER TRIGGERED')
      
      if (!e || typeof e.preventDefault !== 'function') {
        addLog('ERROR: Invalid event object', e)
        throw new Error('Invalid event object')
      }

      e.preventDefault()
      addLog('preventDefault called successfully')
      
      addLog('Form data at submit', formData)
      addLog('Selected images at submit', { count: selectedImages.length, images: selectedImages.map(f => f.name) })
      
      // Detailed validation
      const validationErrors = []
      if (!formData.title) validationErrors.push('Title is required')
      if (!formData.price) validationErrors.push('Price is required')
      if (!formData.stock) validationErrors.push('Stock is required')
      if (!formData.category) validationErrors.push('Category is required')
      if (!formData.description) validationErrors.push('Description is required')
      if (selectedImages.length === 0) validationErrors.push('At least one image is required')

      if (validationErrors.length > 0) {
        const errorMsg = validationErrors.join(', ')
        addLog('VALIDATION FAILED', validationErrors)
        setSubmitError(errorMsg)
        return
      }

      addLog('Validation passed, starting submission...')
      setIsSubmitting(true)
      setSubmitError('')

      // Create FormData
      addLog('Creating FormData object...')
      const productData = new FormData()
      
      Object.keys(formData).forEach(key => {
        addLog(`Appending field: ${key}`, formData[key])
        productData.append(key, formData[key])
      })
      
      selectedImages.forEach((image, index) => {
        addLog(`Appending image ${index}`, { name: image.name, size: image.size })
        productData.append('images', image)
      })

      addLog('FormData created, checking productService...')
      
      if (!productService) {
        throw new Error('productService is undefined')
      }
      if (!productService.createProduct) {
        throw new Error('productService.createProduct is undefined')
      }

      addLog('Calling productService.createProduct...')
      
      const response = await productService.createProduct(productData)
      
      addLog('Product created successfully!', response)
      
      // Reset form
      addLog('Resetting form...')
      setShowForm(false)
      setFormData({ title: '', description: '', price: '', stock: '', category: '', sku: '' })
      setSelectedImages([])
      
      addLog('Fetching updated products...')
      await fetchProducts()
      
      addLog('=== SUBMISSION COMPLETE ===')
      
    } catch (error) {
      addLog('=== SUBMISSION ERROR ===', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      })
      console.error('Submit error:', error)
      console.error('Error response:', error.response)
      setSubmitError(error.response?.data?.message || error.message || 'Failed to create product')
    } finally {
      setIsSubmitting(false)
      addLog('isSubmitting set to false')
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        addLog('Deleting product', productId)
        await productService.deleteProduct(productId)
        await fetchProducts()
        addLog('Product deleted successfully')
      } catch (error) {
        addLog('ERROR deleting product', error)
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      addLog('Updating stock', { productId, newStock })
      await productService.updateStock(productId, { stock: newStock })
      await fetchProducts()
      addLog('Stock updated successfully')
    } catch (error) {
      addLog('ERROR updating stock', error)
      console.error('Failed to update stock:', error)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Debug Console */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-48 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-white">Debug Console</strong>
            <button
              onClick={() => setDebugLogs([])}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Clear
            </button>
          </div>
          {debugLogs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            debugLogs.map((log, i) => (
              <div key={i} className="border-b border-gray-800 py-1">
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                {log.data && (
                  <pre className="text-xs text-yellow-400 ml-4 mt-1">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        {/* Header & Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
          <button
            onClick={() => {
              addLog('Add Product button clicked')
              setShowForm(true)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Add New Product</h3>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      addLog('Title changed', e.target.value)
                      setFormData({ ...formData, title: e.target.value })
                    }}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (KES) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      addLog('Price changed', e.target.value)
                      setFormData({ ...formData, price: e.target.value })
                    }}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => {
                      addLog('Stock changed', e.target.value)
                      setFormData({ ...formData, stock: e.target.value })
                    }}
                    className="w-full px-2 py-1 border rounded"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    addLog('Category changed', e.target.value)
                    setFormData({ ...formData, category: e.target.value })
                  }}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    addLog('Description changed', e.target.value.substring(0, 50) + '...')
                    setFormData({ ...formData, description: e.target.value })
                  }}
                  className="w-full px-3 py-2 border rounded"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Images *</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded"
                  accept="image/*"
                  multiple
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload up to 10 images. First image will be the main display image.
                  {selectedImages.length > 0 && (
                    <span className="text-green-600 font-medium"> ({selectedImages.length} selected)</span>
                  )}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    console.log('Button clicked!', e)
                    addLog('Submit button CLICKED')
                  }}
                  className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addLog('Cancel clicked')
                    setShowForm(false)
                    setSubmitError('')
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found. Create your first product!</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">KES {product.price}</td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleStockUpdate(product._id, e.target.value)}
                        className="w-20 px-2 py-1 border rounded"
                        min="0"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default VendorProducts
