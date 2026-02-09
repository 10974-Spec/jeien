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
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded">
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600">Please refresh the page and try again.</p>
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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getVendorProducts({})
      setProducts(response.data.products || [])
    } catch (error) {
      setSubmitError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      setCategories([])
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validation
      const validationErrors = []
      if (!formData.title) validationErrors.push('Title is required')
      if (!formData.price) validationErrors.push('Price is required')
      if (!formData.stock) validationErrors.push('Stock is required')
      if (!formData.category) validationErrors.push('Category is required')
      if (!formData.description) validationErrors.push('Description is required')
      if (selectedImages.length === 0) validationErrors.push('At least one image is required')

      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(', '))
        return
      }

      setIsSubmitting(true)
      setSubmitError('')

      // Create FormData
      const productData = new FormData()
      Object.keys(formData).forEach(key => {
        productData.append(key, formData[key])
      })

      selectedImages.forEach((image) => {
        productData.append('images', image)
      })

      await productService.createProduct(productData)

      // Reset form
      setShowForm(false)
      setFormData({ title: '', description: '', price: '', stock: '', category: '', sku: '' })
      setSelectedImages([])
      await fetchProducts()

    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId)
        await fetchProducts()
      } catch (error) {
        alert('Failed to delete product')
      }
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await productService.updateStock(productId, { stock: newStock })
      await fetchProducts()
    } catch (error) {
      alert('Failed to update stock')
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header & Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            + Add New Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Add New Product</h3>

            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <strong>Error:</strong> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Product Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Price (KES) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Product Images *</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept="image/*"
                  multiple
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Upload up to 10 images. First image will be the main display image.
                  {selectedImages.length > 0 && (
                    <span className="text-green-600 font-semibold ml-2">({selectedImages.length} selected)</span>
                  )}
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSubmitError('')
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Create your first product to get started!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-14 h-14 object-cover rounded-lg mr-4 border border-gray-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">KES {product.price}</td>
                    <td className="py-4 px-6">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleStockUpdate(product._id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {product.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="px-4 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="px-4 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
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
