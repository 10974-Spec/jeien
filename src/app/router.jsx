import React, { useContext } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import AdminLayout from '../layouts/AdminLayout'
import VendorLayout from '../layouts/VendorLayout'
import PublicLayout from '../layouts/PublicLayout'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

import AdminDashboard from '../pages/admin/Dashboard'
import AdminProducts from '../pages/admin/Products'
import AdminCategories from '../pages/admin/Categories'
import AdminVendors from '../pages/admin/Vendors'
import AdminVendorDetails from '../pages/admin/VendorDetails'
import AdminOrders from '../pages/admin/Orders'
import AdminPayments from '../pages/admin/Payments'
import AdminBanners from '../pages/admin/Banners'
import AdminUsers from '../pages/admin/Users'
import AdminReviews from '../pages/admin/Reviews'
import AdminSettings from '../pages/admin/Settings'
import AdminReports from '../pages/admin/Reports'
import AdminLogs from '../pages/admin/Logs'

import VendorDashboard from '../pages/vendor/Dashboard'
import VendorProducts from '../pages/vendor/Products'
import VendorOrders from '../pages/vendor/Orders'
import VendorStoreSettings from '../pages/vendor/StoreSettings'
import VendorPayments from '../pages/vendor/Payments'

import Home from '../pages/buyer/Home'
import Shop from '../pages/buyer/Shop'
import Search from '../pages/buyer/Search'
import About from '../pages/buyer/About'
import Category from '../pages/buyer/Category'
import ProductDetails from '../pages/buyer/ProductDetails'
import Cart from '../pages/buyer/Cart'
import Checkout from '../pages/buyer/Checkout'
import BuyerProfile from '../pages/buyer/Profile'
import BuyerOrders from '../pages/buyer/Orders'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Normalize the user's role to uppercase for comparison
  const userRole = user?.role?.toUpperCase() || ''

  // Normalize allowed roles to uppercase
  const normalizedAllowedRoles = allowedRoles
    ? allowedRoles.map(role => role.toUpperCase())
    : []

  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    // Redirect user based on their actual role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (userRole === 'VENDOR') {
      return <Navigate to="/vendor/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  if (user) {
    // Normalize role to uppercase
    const role = user?.role?.toUpperCase() || ''

    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (role === 'VENDOR') {
      return <Navigate to="/vendor/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

// ADMIN routes - only accessible to users with 'admin' role
const AdminRoutes = () => (
  <PrivateRoute allowedRoles={['admin']}>
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  </PrivateRoute>
)

// VENDOR routes - accessible to both 'vendor' and 'admin' roles
const VendorRoutes = () => (
  <PrivateRoute allowedRoles={['vendor', 'admin']}>
    <VendorLayout>
      <Outlet />
    </VendorLayout>
  </PrivateRoute>
)

// BUYER/PUBLIC routes - accessible to everyone
const BuyerRoutes = () => (
  <PublicLayout>
    <Outlet />
  </PublicLayout>
)

function AppRouter() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoutes />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        {/* This route will handle both /admin/products and /admin/products/edit/:id */}
        <Route path="products/edit/:id" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="vendors/:id" element={<AdminVendorDetails />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor" element={<VendorRoutes />}>
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="store-settings" element={<VendorStoreSettings />} />
        <Route path="payments" element={<VendorPayments />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Buyer/Public Routes */}
      <Route path="/" element={<BuyerRoutes />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="about" element={<About />} />
        <Route path="category/:id" element={<Category />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />

        {/* Protected buyer-only routes */}
        <Route path="profile" element={
          <PrivateRoute allowedRoles={['buyer', 'vendor', 'admin']}>
            <BuyerProfile />
          </PrivateRoute>
        } />
        <Route path="orders" element={
          <PrivateRoute allowedRoles={['buyer', 'vendor', 'admin']}>
            <BuyerOrders />
          </PrivateRoute>
        } />

        {/* Search page */}
        <Route path="search" element={<Search />} />

        {/* Add vendors page */}
        <Route path="vendors" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendors Page</h1>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        } />

        {/* Add deals redirect to shop with deals filter */}
        <Route path="deals" element={<Navigate to="/shop?deals=true" replace />} />
      </Route>

      {/* 404 - Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter