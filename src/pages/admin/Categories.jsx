import React, { useState, useEffect } from 'react'
import categoryService from '../../services/category.service'
import { 
  Plus, X, Edit, Trash2, Eye, EyeOff, 
  Folder, FolderOpen, Tag, TrendingUp, 
  Image as ImageIcon, Layers, RefreshCw,
  ChevronRight, ChevronDown, Save, AlertCircle,
  CheckCircle, XCircle, BarChart3, Grid
} from 'lucide-react'

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
  const [expandedCategories, setExpandedCategories] = useState({})

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
      active: category.active !== false
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

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
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
    return categoryList.map(category => {
      const hasChildren = getSubcategories(category._id).length > 0
      const isExpanded = expandedCategories[category._id]
      
      return (
        <React.Fragment key={category._id}>
          <tr className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors duration-200">
            <td className="py-4 px-6">
              <div className="flex items-center" style={{ marginLeft: `${level * 28}px` }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(category._id)}
                    className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-6" />}
                
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Folder className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200 flex items-center justify-center">
                      <Folder className="h-6 w-6 text-blue-500" />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {category.name}
                      </span>
                      {level > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Subcategory
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 max-w-md">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {category.stats?.totalProducts || 0}
                </span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-600">
                  {category.commissionRate}%
                </span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                category.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.active ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Inactive</span>
                  </>
                )}
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
                  title="Edit category"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleCategoryStatus(category._id, category.active)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    category.active 
                      ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100' 
                      : 'text-green-600 hover:text-green-700 hover:bg-green-100'
                  }`}
                  title={category.active ? 'Deactivate category' : 'Activate category'}
                >
                  {category.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className={`p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 ${
                    hasChildren ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={hasChildren}
                  title={hasChildren ? "Cannot delete category with subcategories" : "Delete category"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          
          {hasChildren && isExpanded && (
            <>
              {getSubcategories(category._id).map(child => (
                <tr key={child._id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center" style={{ marginLeft: `${(level + 1) * 28}px` }}>
                      <div className="w-6" />
                      <div className="flex items-center gap-3">
                        {child.image ? (
                          <img
                            src={child.image}
                            alt={child.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 flex items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-blue-400" />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {child.name}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Subcategory
                            </span>
                          </div>
                          {child.description && (
                            <p className="text-sm text-gray-500 mt-1 max-w-md">
                              {child.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {child.stats?.totalProducts || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600">
                        {child.commissionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      child.active 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {child.active ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        title="Edit subcategory"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleCategoryStatus(child._id, child.active)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          child.active 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-100'
                        }`}
                        title={child.active ? 'Deactivate subcategory' : 'Activate subcategory'}
                      >
                        {child.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(child._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                        title="Delete subcategory"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Grid className="h-8 w-8 text-blue-500" />
              Categories Management
            </h1>
            <p className="text-gray-600 mt-2">Organize products with hierarchical categories</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              {editingId ? 'Edit Category' : 'Add New Category'}
            </button>
            <button
              onClick={fetchCategories}
              className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Grid className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Categories</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {categories.filter(cat => cat.active !== false).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive Categories</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {categories.filter(cat => cat.active === false).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {categories.reduce((total, cat) => total + (cat.stats?.totalProducts || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  {editingId ? (
                    <Edit className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Plus className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-sm text-gray-500">Fill in the category details below</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                    {formErrors.name && (
                      <span className="text-red-500 text-sm ml-2 font-normal">{formErrors.name}</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="e.g., Electronics, Clothing"
                      disabled={submitting}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Tag className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission Rate (%) <span className="text-red-500">*</span>
                    {formErrors.commissionRate && (
                      <span className="text-red-500 text-sm ml-2 font-normal">{formErrors.commissionRate}</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        formErrors.commissionRate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={submitting}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Percentage taken from each sale in this category</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows="3"
                  placeholder="Describe this category..."
                  disabled={submitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
                  <div className="relative">
                    <select
                      value={formData.parent}
                      onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                      disabled={submitting}
                    >
                      <option value="">No Parent (Root Category)</option>
                      {categories
                        .filter(cat => !editingId || cat._id !== editingId)
                        .map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                            {category.parent && ` (Child of ${category.parent.name})`}
                          </option>
                        ))
                      }
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to create a root category. Select a parent to create a subcategory.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image</label>
                  <div className="relative">
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">
                          {selectedFile ? selectedFile.name : 'Click to upload image'}
                        </p>
                        <p className="text-sm text-gray-500">Recommended: 500x500px, JPG/PNG format</p>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                        accept="image/*"
                        disabled={submitting}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <div className={`w-10 h-6 rounded-full transition-all duration-300 ${
                      formData.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                        formData.active ? 'left-5' : 'left-1'
                      }`}></div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Active Category</span>
                    <p className="text-sm text-gray-500">Inactive categories won't be visible to customers</p>
                  </div>
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    submitting 
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {editingId ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Categories Overview
              </h2>
              <p className="text-gray-600 mt-1">Showing all categories in hierarchical view</p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <span className="font-medium">{categories.length}</span> categories total
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading categories...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your categories</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Grid className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Get started by creating your first category to organize your products
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create First Category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Products
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderCategoryTree(getRootCategories())}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">Legend:</span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <Folder className="h-3 w-3" />
                      Root Category
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      <FolderOpen className="h-3 w-3" />
                      Subcategory
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Note:</span> Categories with subcategories cannot be deleted
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminCategories