import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/user.service'
import orderService from '../../services/order.service'

const Profile = () => {
  const { user, updateProfile, updateProfileImage } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [addresses, setAddresses] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [profileRes, ordersRes] = await Promise.all([
        userService.getUserProfile(),
        orderService.getMyOrders({ limit: 5 })
      ])

      setAddresses(profileRes.data.user?.addresses || [])
      setRecentOrders(ordersRes.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileData)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) return

    try {
      await updateProfileImage(imageFile)
      setImageFile(null)
      alert('Profile image updated successfully!')
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image')
    }
  }

  const handleAddressAction = async (action, addressData) => {
    try {
      await userService.manageAddresses({
        action,
        ...addressData
      })
      fetchUserData()
      alert('Address updated successfully!')
    } catch (error) {
      console.error('Failed to manage address:', error)
      alert('Failed to update address')
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Please login to view profile</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
                <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                  <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                    accept="image/*"
                  />
                  📷
                </label>
              </div>
              {imageFile && (
                <div className="mt-2">
                  <button
                    onClick={handleImageUpload}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Upload Photo
                  </button>
                </div>
              )}
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'personal'
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'addresses'
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'orders'
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'security'
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
              {/* Personal Information */}
              {activeTab === 'personal' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          className="w-full px-3 py-2 border rounded bg-gray-50"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="e.g., 0712345678"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>
              )}

              {/* Addresses */}
              {activeTab === 'addresses' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Saved Addresses</h2>
                    <button
                      onClick={() => setActiveTab('new-address')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No saved addresses</p>
                      <button
                        onClick={() => setActiveTab('new-address')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className="border rounded-lg p-4 hover:border-blue-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold">{address.fullName}</p>
                              <p className="text-gray-600">{address.phone}</p>
                            </div>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4">
                            {address.street}<br />
                            {address.city}, {address.country}<br />
                            {address.postalCode && `Postal Code: ${address.postalCode}`}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddressAction('set-default', { addressId: address._id })}
                              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            >
                              Set as Default
                            </button>
                            <button
                              onClick={() => handleAddressAction('delete', { addressId: address._id })}
                              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {activeTab === 'new-address' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6">Add New Address</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const addressData = {
                      fullName: formData.get('fullName'),
                      phone: formData.get('phone'),
                      country: formData.get('country'),
                      city: formData.get('city'),
                      street: formData.get('street'),
                      postalCode: formData.get('postalCode'),
                      isDefault: formData.get('isDefault') === 'on',
                    }
                    handleAddressAction('add', { address: addressData })
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          defaultValue={user.name}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          defaultValue={user.phone}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Country *
                        </label>
                        <select
                          name="country"
                          defaultValue="Kenya"
                          className="w-full px-3 py-2 border rounded"
                          required
                        >
                          <option value="Kenya">Kenya</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          City/Town *
                        </label>
                        <input
                          type="text"
                          name="city"
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Street Address *
                      </label>
                      <textarea
                        name="street"
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          className="mr-2"
                        />
                        <label htmlFor="isDefault" className="text-sm">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('addresses')}
                        className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order History */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
                  
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No orders yet</p>
                      <a
                        href="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Start Shopping
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold">{order.orderId}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">KES {order.totalAmount}</p>
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Items:</p>
                            <div className="space-y-2">
                              {order.items?.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center text-sm">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-10 h-10 object-cover rounded mr-3"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p>{item.title}</p>
                                    <p className="text-gray-500">
                                      Qty: {item.quantity} × KES {item.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order.items && order.items.length > 2 && (
                                <p className="text-sm text-gray-500">
                                  + {order.items.length - 2} more items
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              Delivery: {order.deliveryAddress?.city}
                            </p>
                            <a
                              href={`/orders/${order._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Details →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <a
                      href="/orders"
                      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      View All Orders
                    </a>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Change Password</h3>
                      <form className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-3">Account Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 border rounded hover:bg-gray-50">
                          Download Personal Data
                        </button>
                        <button className="w-full text-left px-4 py-3 border rounded hover:bg-gray-50 text-red-600">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile