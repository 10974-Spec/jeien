import React, { useState, useEffect } from 'react'
import vendorService from '../../services/vendor.service'

const VendorStoreSettings = () => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    description: '',
    contactInfo: {
      email: '',
      phone: '',
      address: '',
    },
    socialLinks: {
      website: '',
      facebook: '',
      instagram: '',
    },
    settings: {
      autoApproveProducts: true,
      lowStockThreshold: 10,
      allowReviews: true,
    },
  })
  const [bankDetails, setBankDetails] = useState({
    provider: 'MPESA',
    accountName: '',
    accountNumber: '',
    phoneNumber: '',
    bankName: '',
    branch: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      const response = await vendorService.getVendorStore()
      const vendor = response.data.vendor
      
      if (vendor) {
        setStoreInfo({
          storeName: vendor.storeName || '',
          description: vendor.description || '',
          contactInfo: vendor.contactInfo || { email: '', phone: '', address: '' },
          socialLinks: vendor.socialLinks || { website: '', facebook: '', instagram: '' },
          settings: vendor.settings || { autoApproveProducts: true, lowStockThreshold: 10, allowReviews: true },
        })
        setBankDetails(vendor.bankDetails || {
          provider: 'MPESA',
          accountName: '',
          accountNumber: '',
          phoneNumber: '',
          bankName: '',
          branch: '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setStoreInfo(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }))
    } else if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1]
      setStoreInfo(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value
        }
      }))
    } else if (name.startsWith('settings.')) {
      const field = name.split('.')[1]
      setStoreInfo(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: value === 'true' || value === true
        }
      }))
    } else {
      setStoreInfo(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target
    setBankDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleStoreInfoSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await vendorService.updateVendorStore(storeInfo)
      alert('Store information updated successfully!')
    } catch (error) {
      console.error('Failed to update store info:', error)
      alert('Failed to update store information')
    } finally {
      setSaving(false)
    }
  }

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await vendorService.updateBankDetails(bankDetails)
      alert('Bank details updated successfully!')
    } catch (error) {
      console.error('Failed to update bank details:', error)
      alert('Failed to update bank details')
    } finally {
      setSaving(false)
    }
  }

  const handleImagesUpload = async () => {
    try {
      setSaving(true)
      const formData = new FormData()
      if (logoFile) formData.append('logo', logoFile)
      if (bannerFile) formData.append('banner', bannerFile)
      
      await vendorService.updateStoreImages(formData)
      setLogoFile(null)
      setBannerFile(null)
      alert('Store images updated successfully!')
    } catch (error) {
      console.error('Failed to upload images:', error)
      alert('Failed to upload images')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading store settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Store Information</h3>
        <form onSubmit={handleStoreInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={storeInfo.storeName}
              onChange={handleStoreInfoChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Store Description</label>
            <textarea
              name="description"
              value={storeInfo.description}
              onChange={handleStoreInfoChange}
              className="w-full px-3 py-2 border rounded"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={storeInfo.contactInfo.email}
                onChange={handleStoreInfoChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                name="contactInfo.phone"
                value={storeInfo.contactInfo.phone}
                onChange={handleStoreInfoChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Store Address</label>
            <textarea
              name="contactInfo.address"
              value={storeInfo.contactInfo.address}
              onChange={handleStoreInfoChange}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                name="socialLinks.website"
                value={storeInfo.socialLinks.website}
                onChange={handleStoreInfoChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                name="socialLinks.facebook"
                value={storeInfo.socialLinks.facebook}
                onChange={handleStoreInfoChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://facebook.com/"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="url"
                name="socialLinks.instagram"
                value={storeInfo.socialLinks.instagram}
                onChange={handleStoreInfoChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://instagram.com/"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Store Settings</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveProducts"
                name="settings.autoApproveProducts"
                checked={storeInfo.settings.autoApproveProducts}
                onChange={(e) => handleStoreInfoChange({
                  target: {
                    name: 'settings.autoApproveProducts',
                    value: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <label htmlFor="autoApproveProducts" className="text-sm">
                Auto-approve new products
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowReviews"
                name="settings.allowReviews"
                checked={storeInfo.settings.allowReviews}
                onChange={(e) => handleStoreInfoChange({
                  target: {
                    name: 'settings.allowReviews',
                    value: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <label htmlFor="allowReviews" className="text-sm">
                Allow customer reviews
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input
                type="number"
                name="settings.lowStockThreshold"
                value={storeInfo.settings.lowStockThreshold}
                onChange={handleStoreInfoChange}
                className="w-32 px-3 py-2 border rounded"
                min="1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Store Information'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Store Images</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Logo</label>
            <input
              type="file"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full px-3 py-2 border rounded"
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 200×200 pixels, PNG or JPG
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Store Banner</label>
            <input
              type="file"
              onChange={(e) => setBannerFile(e.target.files[0])}
              className="w-full px-3 py-2 border rounded"
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 1200×300 pixels, PNG or JPG
            </p>
          </div>
          <button
            onClick={handleImagesUpload}
            disabled={saving || (!logoFile && !bannerFile)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Bank Details for Payouts</h3>
        <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Provider</label>
            <select
              name="provider"
              value={bankDetails.provider}
              onChange={handleBankDetailsChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="MPESA">M-Pesa</option>
              <option value="BANK">Bank Transfer</option>
              <option value="PAYPAL">PayPal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {bankDetails.provider === 'MPESA' && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={bankDetails.phoneNumber}
                onChange={handleBankDetailsChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., 0712345678"
              />
            </div>
          )}

          {(bankDetails.provider === 'BANK' || bankDetails.provider === 'OTHER') && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={bankDetails.accountName}
                  onChange={handleBankDetailsChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </>
          )}

          {bankDetails.provider === 'BANK' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankDetailsChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={bankDetails.branch}
                  onChange={handleBankDetailsChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </>
          )}

          {bankDetails.provider === 'PAYPAL' && (
            <div>
              <label className="block text-sm font-medium mb-1">PayPal Email</label>
              <input
                type="email"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="paypal@example.com"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VendorStoreSettings