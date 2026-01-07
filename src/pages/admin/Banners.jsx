import React, { useState, useEffect } from 'react'
import bannerService from '../../services/banner.service'

const AdminBanners = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    linkType: 'URL',
    position: 'HOME_TOP',
    type: 'BANNER',
    startDate: '',
    endDate: '',
    priority: 0,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await bannerService.getAllAds({ owner: 'ADMIN' })
      setBanners(response.data.ads || [])
    } catch (error) {
      console.error('Failed to fetch banners:', error)
      setError('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.link.trim()) {
        throw new Error('Link URL is required')
      }
      if (!formData.startDate) {
        throw new Error('Start date is required')
      }
      if (!formData.endDate) {
        throw new Error('End date is required')
      }
      if (!selectedFile) {
        throw new Error('Banner image is required')
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(selectedFile.type)) {
        throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Create FormData object
      const formDataObj = new FormData()
      
      // Append all form fields
      formDataObj.append('title', formData.title.trim())
      formDataObj.append('description', formData.description.trim())
      formDataObj.append('link', formData.link.trim())
      formDataObj.append('linkType', formData.linkType)
      formDataObj.append('position', formData.position)
      formDataObj.append('type', formData.type)
      formDataObj.append('startDate', formData.startDate)
      formDataObj.append('endDate', formData.endDate)
      formDataObj.append('priority', formData.priority.toString())
      
      // Append JSON strings
      formDataObj.append('budget', JSON.stringify({
        total: 0,
        spent: 0,
        dailyLimit: 0,
        costPerClick: 0,
        costPerView: 0
      }))
      
      formDataObj.append('targeting', JSON.stringify({}))
      
      formDataObj.append('settings', JSON.stringify({
        frequency: 1,
        rotation: true,
        closeable: true,
        backgroundColor: '#FFFFFF',
        textColor: '#000000'
      }))
      
      // Append image file with field name 'image'
      formDataObj.append('image', selectedFile)

      // Debug: Log FormData
      console.log('=== FORM DATA DEBUG ===');
      console.log('Is FormData?', formDataObj instanceof FormData);
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }

      setUploadProgress(50)

      // Send the request
      console.log('Creating banner...');
      const response = await bannerService.createAd(formDataObj);
      console.log('Response:', response);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      console.log('✓ Banner created successfully:', response.data);
      setUploadProgress(100);

      // Reset form and refresh
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        link: '',
        linkType: 'URL',
        position: 'HOME_TOP',
        type: 'BANNER',
        startDate: '',
        endDate: '',
        priority: 0,
      });
      setSelectedFile(null);
      fetchBanners();
      
      // Show success message
      alert('Banner created successfully!');
      
    } catch (error) {
      console.error('=== BANNER CREATION FAILED ===', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create banner';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const handleStatusChange = async (bannerId, active) => {
    try {
      await bannerService.updateAd(bannerId, { active })
      fetchBanners()
      alert(`Banner ${active ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Failed to update banner status:', error)
      alert('Failed to update banner status')
    }
  }

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      try {
        await bannerService.deleteAd(bannerId)
        fetchBanners()
        alert('Banner deleted successfully!')
      } catch (error) {
        console.error('Failed to delete banner:', error)
        alert('Failed to delete banner')
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Banners & Ads Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Add New Banner'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError('')}
            className="float-right text-red-900 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Create New Banner/Ad</h3>
            <button
              type="button"
              onClick={() => {
                if (!isUploading && window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                  setShowForm(false)
                  setSelectedFile(null)
                  setError('')
                }
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
          
          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">Uploading...</span>
                <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                  disabled={isUploading}
                  placeholder="Enter banner title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={isUploading}
                >
                  <option value="HOME_TOP">Home Page - Top</option>
                  <option value="HOME_MIDDLE">Home Page - Middle</option>
                  <option value="HOME_BOTTOM">Home Page - Bottom</option>
                  <option value="CATEGORY_TOP">Category Page - Top</option>
                  <option value="PRODUCT_SIDEBAR">Product Page - Sidebar</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
                <span className="text-xs text-gray-500 ml-1">(optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                rows="2"
                disabled={isUploading}
                placeholder="Enter banner description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                  disabled={isUploading}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link Type</label>
                <select
                  value={formData.linkType}
                  onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={isUploading}
                >
                  <option value="URL">External URL</option>
                  <option value="PRODUCT">Product Page</option>
                  <option value="CATEGORY">Category Page</option>
                  <option value="VENDOR">Vendor Page</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                  disabled={isUploading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                  disabled={isUploading}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  min="0"
                  max="100"
                  disabled={isUploading}
                  placeholder="0 (default)"
                />
                <p className="text-xs text-gray-500 mt-1">Higher number = higher priority</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept="image/*"
                  required
                  disabled={isUploading}
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Selected:</span> {selectedFile.name}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported: JPG, PNG, GIF, WebP • Max: 5MB
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Banner'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isUploading && window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                    setShowForm(false)
                    setSelectedFile(null)
                    setError('')
                  }
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                disabled={isUploading}
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
            <h2 className="text-lg font-semibold text-gray-800">All Banners</h2>
            <div className="text-sm text-gray-600">
              Total: <span className="font-medium">{banners.length}</span> banners
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No banners found</p>
            <p className="text-gray-400 text-sm mb-4">Create your first banner to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Create Your First Banner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-20 h-12 object-cover rounded mr-4 border"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x48/ccc/999?text=No+Image'
                            }}
                          />
                        ) : (
                          <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center mr-4 border">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{banner.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{banner.description}</p>
                          <p className="text-xs text-blue-600 mt-1 truncate max-w-xs">{banner.link}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {banner.position.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{formatDate(banner.startDate)}</div>
                        <div className="text-gray-500">to</div>
                        <div className="font-medium">{formatDate(banner.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <span className="w-20 text-gray-600">Views:</span>
                          <span className="font-medium">{banner.stats?.views || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-20 text-gray-600">Clicks:</span>
                          <span className="font-medium">{banner.stats?.clicks || 0}</span>
                        </div>
                        {banner.stats?.views > 0 && (
                          <div className="flex items-center mt-1">
                            <span className="w-20 text-gray-600">CTR:</span>
                            <span className="font-medium">
                              {((banner.stats.clicks / banner.stats.views) * 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        banner.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(banner._id, !banner.active)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            banner.active 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={banner.active ? 'Deactivate banner' : 'Activate banner'}
                        >
                          {banner.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Delete banner"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBanners