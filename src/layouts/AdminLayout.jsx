import React, { useState, useContext } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { isAdmin } = useRole()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '📑' },
    { path: '/admin/vendors', label: 'Vendors', icon: '🏪' },
    { path: '/admin/orders', label: 'Orders', icon: '📋' },
    { path: '/admin/payments', label: 'Payments & Commissions', icon: '💰' },
    { path: '/admin/banners', label: 'Banners & Ads', icon: '🎯' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300`}>
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          <nav className="mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center p-3 hover:bg-gray-800 transition-colors"
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
                <div className="relative">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    🔔
                  </button>
                </div>

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
                    <p className="text-sm text-gray-500">Admin</p>
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
            <div className="flex justify-between text-sm text-gray-500">
              <span>© 2024 Multi-Vendor E-commerce</span>
              <span>v1.0.0 | {import.meta.env.MODE}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout