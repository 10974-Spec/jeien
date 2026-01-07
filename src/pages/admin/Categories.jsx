import React, { useState, useEffect } from 'react'
import categoryService from '../../services/category.service'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commissionRate: 10,
    parent: '',
    active: true
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getAllCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      alert('Failed to load categories: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required'
    }
    
    if (formData.commissionRate < 0 || formData.commissionRate > 100 || isNaN(formData.commissionRate)) {
      errors.commissionRate = 'Commission rate must be between 0 and 100'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Append form data
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('commissionRate', formData.commissionRate.toString())
      formDataToSend.append('active', formData.active.toString())
      
      // Append parent if selected (empty string for no parent)
      if (formData.parent && formData.parent !== '') {
        formDataToSend.append('parent', formData.parent)
      }
      
      // Append image if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }
      
      console.log('FormData being sent:', {
        name: formData.name,
        commissionRate: formData.commissionRate,
        parent: formData.parent,
        hasFile: !!selectedFile
      })
      
      let response
      
      if (editingId) {
        // Update existing category
        response = await categoryService.updateCategory(editingId, formDataToSend)
        alert('Category updated successfully!')
      } else {
        // Create new category
        response = await categoryService.createCategory(formDataToSend)
        alert('Category created successfully!')
      }
      
      // Reset form and refresh
      resetForm()
      fetchCategories()
      
    } catch (error) {
      console.error('Failed to save category:', error)
      
      const errorMessage = error.response?.data?.message || error.message
      
      if (error.response?.data?.existingCategory) {
        alert(`Category already exists: "${error.response.data.existingCategory.name}"`)
      } else {
        alert('Failed to save category: ' + errorMessage)
      }
      
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category._id)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      commissionRate: category.commissionRate || 10,
      parent: category.parent?._id || '',
      active: category.active !== false // default to true
    })
    setSelectedFile(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone and may affect products in this category.')) {
      try {
        await categoryService.deleteCategory(categoryId)
        alert('Category deleted successfully!')
        fetchCategories()
      } catch (error) {
        console.error('Failed to delete category:', error)
        alert('Failed to delete category: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await categoryService.updateCategory(categoryId, { active: !currentStatus })
      alert(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
      fetchCategories()
    } catch (error) {
      console.error('Failed to update category status:', error)
      alert('Failed to update category status: ' + (error.response?.data?.message || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      commissionRate: 10,
      parent: '',
      active: true
    })
    setSelectedFile(null)
    setEditingId(null)
    setShowForm(false)
    setFormErrors({})
    setSubmitting(false)
  }

  const getRootCategories = () => {
    return categories.filter(cat => !cat.parent || cat.parent === null)
  }

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent?._id === parentId)
  }

  const renderCategoryTree = (categoryList, level = 0) => {
    return categoryList.map(category => (
      <React.Fragment key={category._id}>
        <tr className="border-b hover:bg-gray-50">
          <td className="py-4 px-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-10 h-10 object-cover rounded mr-3"
                />
              )}
              <div>
                <p className="font-medium">
                  {category.name}
                  {level > 0 && <span className="ml-2 text-xs text-gray-500">(Subcategory)</span>}
                </p>
                {category.description && (
                  <p className="text-sm text-gray-500 truncate max-w-md">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </td>
          <td className="py-4 px-4">{category.stats?.totalProducts || 0}</td>
          <td className="py-4 px-4">{category.commissionRate}%</td>
          <td className="py-4 px-4">
            <span className={`px-2 py-1 rounded text-xs ${
              category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {category.active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="py-4 px-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => toggleCategoryStatus(category._id, category.active)}
                className={`px-3 py-1 text-sm rounded hover:bg-opacity-90 ${
                  category.active 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {category.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={getSubcategories(category._id).length > 0}
                title={getSubcategories(category._id).length > 0 ? "Cannot delete category with subcategories" : ""}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
        {getSubcategories(category._id).length > 0 && 
          renderCategoryTree(getSubcategories(category._id), level + 1)
        }
      </React.Fragment>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
          <p className="text-gray-600">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {editingId ? 'Edit Category' : 'Add New Category'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name *
                  {formErrors.name && (
                    <span className="text-red-500 text-xs ml-2">{formErrors.name}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Electronics, Clothing"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Commission Rate (%) *
                  {formErrors.commissionRate && (
                    <span className="text-red-500 text-xs ml-2">{formErrors.commissionRate}</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.commissionRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">Percentage taken from each sale in this category</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Describe this category..."
                disabled={submitting}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category (Optional)</label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">No Parent (Root Category)</option>
                  {categories
                    .filter(cat => !editingId || cat._id !== editingId) // Don't allow self as parent
                    .map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                        {category.parent && ` (Child of ${category.parent.name})`}
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create a root category. Select a parent to create a subcategory.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category Image (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 500x500px, JPG/PNG format
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-blue-500 focus:ring-blue-500"
                  disabled={submitting}
                />
                <span className="text-sm font-medium">Active Category</span>
              </label>
              <span className="text-xs text-gray-500">
                Inactive categories won't be visible to customers
              </span>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded transition-colors ${
                  submitting 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingId ? 'Update Category' : 'Create Category'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              All Categories ({categories.length})
            </h2>
            <div className="text-sm text-gray-600">
              Showing all categories in hierarchical view
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found. Create your first category!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Commission</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryTree(getRootCategories())}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && categories.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <span className="font-medium">Legend:</span>
                <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Inactive</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">
                  Categories with subcategories cannot be deleted
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories