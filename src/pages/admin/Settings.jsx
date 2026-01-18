import React, { useState } from 'react'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'jeien agencies',
    siteEmail: 'support@jeien.com',
    sitePhone: '+254746917511',
    currency: 'KES',
    defaultCommission: 10,
    allowVendorRegistration: true,
    autoApproveVendors: false,
    requireProductApproval: true,
    maintenanceMode: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In real app, save settings to backend
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Email</label>
              <input
                type="email"
                name="siteEmail"
                value={settings.siteEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Phone</label>
              <input
                type="text"
                name="sitePhone"
                value={settings.sitePhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Default Commission Rate (%)
              </label>
              <input
                type="number"
                name="defaultCommission"
                value={settings.defaultCommission}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.1"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Platform Settings</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowVendorRegistration"
                name="allowVendorRegistration"
                checked={settings.allowVendorRegistration}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="allowVendorRegistration" className="text-sm">
                Allow Vendor Registration
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveVendors"
                name="autoApproveVendors"
                checked={settings.autoApproveVendors}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="autoApproveVendors" className="text-sm">
                Auto-approve New Vendors
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireProductApproval"
                name="requireProductApproval"
                checked={settings.requireProductApproval}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="requireProductApproval" className="text-sm">
                Require Product Approval
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="maintenanceMode" className="text-sm">
                Maintenance Mode
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableMpesa"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="enableMpesa" className="text-sm">
                  Enable M-Pesa Payments
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePaypal"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="enablePaypal" className="text-sm">
                  Enable PayPal Payments
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCards"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="enableCards" className="text-sm">
                  Enable Credit/Debit Cards
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Clear All Caches
            </button>
            <p className="text-sm text-gray-500 mt-1">Clear all system caches</p>
          </div>
          <div>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Reset Database
            </button>
            <p className="text-sm text-gray-500 mt-1">Warning: This will delete all data!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings