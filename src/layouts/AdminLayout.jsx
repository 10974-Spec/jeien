import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'
import NotificationBell from '../components/NotificationBell'
import {
  LayoutDashboard, Package, FolderTree, Store,
  ShoppingCart, CreditCard, Image, Users,
  Star, Settings, Bell, LogOut, User,
  ChevronLeft, ChevronRight, Menu, X,
  BarChart3, Shield, FileText, Home,
  ArrowLeft, ShoppingBag
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { isAdmin } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
    { path: '/admin/vendors', label: 'Vendors', icon: Store },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/banners', label: 'Banners', icon: Image },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const goToShop = () => {
    navigate('/')
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <h1 className="font-bold text-lg">Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToShop}
              className="p-2 rounded-lg hover:bg-blue-600 transition-colors"
              title="Back to Shop"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-blue-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex pt-16 md:pt-0">
        {/* Sidebar - Desktop & Mobile */}
        <aside
          className={`
            fixed md:relative z-40 h-full md:h-screen
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            ${sidebarOpen ? 'w-64' : 'w-20'}
            md:translate-x-0
            bg-gradient-to-b from-blue-900 to-blue-800 text-white
            shadow-2xl md:shadow-lg
          `}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className={`p-6 border-b border-blue-700/50 ${!sidebarOpen && 'md:px-4'}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-3 ${!sidebarOpen && 'md:justify-center'}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  {sidebarOpen && (
                    <div>
                      <h1 className="text-xl font-bold">JEIEN Admin</h1>
                      <p className="text-blue-200 text-xs">Premium Marketplace</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ChevronLeft className={`h-4 w-4 transition-transform ${!sidebarOpen && 'rotate-180'}`} />
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div className={`p-4 border-b border-blue-700/30 ${!sidebarOpen && 'md:px-3'}`}>
              <div className={`flex items-center gap-3 ${!sidebarOpen && 'md:justify-center'}`}>
                <div className="relative">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-blue-900 rounded-full"></div>
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name || 'Admin'}</p>
                    <p className="text-blue-200 text-xs truncate">{user?.email || 'caprufru@gmail.com'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isActive
                            ? 'bg-white/10 text-white shadow-lg'
                            : 'hover:bg-white/5 text-blue-100 hover:text-white'
                          }
                          ${!sidebarOpen && 'md:justify-center md:px-3'}
                        `}
                      >
                        <div className={`relative ${isActive ? 'text-white' : 'text-blue-200'}`}>
                          <Icon className="h-5 w-5" />
                          {isActive && (
                            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 font-medium">{item.label}</span>
                            {isActive && (
                              <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t border-blue-700/50 ${!sidebarOpen && 'md:px-3'}`}>
              <button
                onClick={goToShop}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 mb-3
                  bg-blue-600/20 hover:bg-blue-600/30
                  text-blue-100 hover:text-white
                  rounded-xl transition-all duration-200
                  ${!sidebarOpen && 'md:justify-center md:px-3'}
                `}
              >
                <ShoppingBag className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">Back to Shop</span>}
              </button>

              <button
                onClick={handleLogout}
                className={`
                  flex items-center gap-3 w-full px-4 py-3
                  bg-red-500/20 hover:bg-red-500/30
                  text-red-100 hover:text-white
                  rounded-xl transition-all duration-200
                  ${!sidebarOpen && 'md:justify-center md:px-3'}
                `}
              >
                <LogOut className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">Logout</span>}
              </button>

              {sidebarOpen && (
                <div className="mt-4 pt-4 border-t border-blue-700/30">
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span>JEIEN v1.0.0</span>
                    <span className="px-2 py-1 bg-blue-700/30 rounded">Beta</span>
                  </div>
                  <p className="text-blue-400/70 text-xs mt-2">
                    Premium Admin Panel
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : 'md:ml-20'}`}>
          {/* Desktop Header */}
          <header className="hidden md:block bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Admin Dashboard</h2>
                    <p className="text-sm text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={goToShop}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-blue-700 hover:text-blue-800"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="font-medium text-sm">Back to Shop</span>
                </button>

                <NotificationBell />

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{user?.name?.split(' ')[0] || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area with Proper Padding */}
          <main className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 min-h-[calc(100vh-200px)] md:min-h-[calc(100vh-120px)] m-4 md:m-6">
              {/* Page Header with Back Button */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {location.pathname !== '/admin/dashboard' && (
                      <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back</span>
                      </button>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                      </h1>
                      <p className="text-gray-500 text-sm mt-1">
                        Manage your {location.pathname.split('/').pop()?.replace('-', ' ') || 'dashboard'} from here
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToShop}
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span className="font-medium text-sm">Visit Shop</span>
                    </button>

                    <div className="hidden md:block text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content with Proper Padding */}
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50">
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4 mb-2 md:mb-0">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  System Status: <span className="font-medium text-gray-700">Operational</span>
                </span>
                <span className="hidden md:inline">•</span>
                <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  <Home className="h-4 w-4" />
                </Link>
                <span>© 2024 JEIEN Marketplace</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  Admin v1.0.0
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout