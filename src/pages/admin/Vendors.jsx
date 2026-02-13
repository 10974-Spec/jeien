import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import vendorService from '../../services/vendor.service'

const AdminVendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, vendor: null })

  useEffect(() => {
    fetchVendors()
  }, [search, statusFilter])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.active = statusFilter === 'active'

      const response = await vendorService.getAllVendors(params)
      setVendors(response.data.vendors || [])
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (vendorId, active) => {
    try {
      await vendorService.updateVendorStatus(vendorId, { active })
      fetchVendors()
    } catch (error) {
      console.error('Failed to update vendor status:', error)
    }
  }

  const handleVerification = async (vendorId, verified) => {
    try {
      await vendorService.updateVendorStatus(vendorId, { verified })
      fetchVendors()
    } catch (error) {
      console.error('Failed to update verification:', error)
    }
  }

  const handleDeleteClick = (vendor) => {
    setDeleteModal({ show: true, vendor })
  }

  const handleDeleteConfirm = async () => {
    try {
      await vendorService.deleteVendor(deleteModal.vendor._id)
      setDeleteModal({ show: false, vendor: null })
      fetchVendors()
      alert('Vendor deleted successfully')
    } catch (error) {
      console.error('Failed to delete vendor:', error)
      alert('Failed to delete vendor: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Vendors Management</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading vendors...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Store</th>
                  <th className="text-left py-3">Owner</th>
                  <th className="text-left py-3">Products</th>
                  <th className="text-left py-3">Sales</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center">
                        {vendor.storeLogo && (
                          <img
                            src={vendor.storeLogo}
                            alt={vendor.storeName}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium">{vendor.storeName}</p>
                          <p className="text-sm text-gray-500">{vendor.verified && '✓ Verified'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p>{vendor.user?.name}</p>
                      <p className="text-sm text-gray-500">{vendor.user?.email}</p>
                    </td>
                    <td className="py-4">{vendor.stats?.totalProducts || 0}</td>
                    <td className="py-4">KES {vendor.stats?.totalRevenue || 0}</td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded text-xs ${vendor.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {vendor.active ? 'Active' : 'Inactive'}
                        </span>
                        {vendor.verified && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(vendor._id, !vendor.active)}
                          className={`px-3 py-1 text-sm rounded ${vendor.active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          {vendor.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleVerification(vendor._id, !vendor.verified)}
                          className={`px-3 py-1 text-sm rounded ${vendor.verified
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                        >
                          {vendor.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <Link
                          to={`/admin/vendors/${vendor._id}`}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 inline-block"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(vendor)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete vendor <strong>{deleteModal.vendor?.storeName}</strong>?
              This action cannot be undone and will delete all associated products.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, vendor: null })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVendors