import React, { useState, useContext, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'

const VendorLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { isVendor } = useRole()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [storeInfo, setStoreInfo] = useState(null)

  const menuItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vendor/products', label: 'Products', icon: '📦' },
    { path: '/vendor/orders', label: 'Orders', icon: '📋' },
    { path: '/vendor/store-settings', label: 'Store Settings', icon: '🏪' },
    { path: '/vendor/payments', label: 'Payments', icon: '💰' },
  ]

  useEffect(() => {
    // In real implementation, fetch store info from API
    setStoreInfo({
      storeName: user?.storeName || `${user?.name}'s Store`,
      storeLogo: user?.storeLogo,
    })
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isVendor()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300`}>
          <div className="p-4 border-b border-blue-800">
            <div className="flex items-center">
              {storeInfo?.storeLogo ? (
                <img
                  src={storeInfo.storeLogo}
                  alt={storeInfo.storeName}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                  🏪
                </div>
              )}
              {sidebarOpen && (
                <div>
                  <h1 className="text-sm font-bold">{storeInfo?.storeName}</h1>
                  <p className="text-xs text-blue-200">Vendor Dashboard</p>
                </div>
              )}
            </div>
          </div>
          
          <nav className="mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center p-3 hover:bg-blue-800 transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow">
            <div className="px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                ☰
              </button>

              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  View Store
                </Link>

                <div className="flex items-center space-x-3">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      👤
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">Vendor</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          <footer className="bg-white border-t px-6 py-3">
            <div className="text-sm text-gray-500 text-center">
              <span>Vendor Dashboard © 2024</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default VendorLayout