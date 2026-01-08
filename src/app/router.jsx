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
import AdminOrders from '../pages/admin/Orders'
import AdminPayments from '../pages/admin/Payments'
import AdminBanners from '../pages/admin/Banners'
import AdminUsers from '../pages/admin/Users'
import AdminReviews from '../pages/admin/Reviews'
import AdminSettings from '../pages/admin/Settings'

import VendorDashboard from '../pages/vendor/Dashboard'
import VendorProducts from '../pages/vendor/Products'
import VendorOrders from '../pages/vendor/Orders'
import VendorStoreSettings from '../pages/vendor/StoreSettings'
import VendorPayments from '../pages/vendor/Payments'

import Home from '../pages/buyer/Home'
import Category from '../pages/buyer/Category'
import ProductDetails from '../pages/buyer/ProductDetails'
import Cart from '../pages/buyer/Cart'
import Checkout from '../pages/buyer/Checkout'
import BuyerProfile from '../pages/buyer/Profile'
import BuyerOrders from '../pages/buyer/Orders'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    const role = user.role
    if (role === 'ADMIN' || role === 'VENDOR') {
      return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

const AdminRoutes = () => (
  <PrivateRoute allowedRoles={['ADMIN']}>
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  </PrivateRoute>
)

const VendorRoutes = () => (
  <PrivateRoute allowedRoles={['VENDOR', 'ADMIN']}>
    <VendorLayout>
      <Outlet />
    </VendorLayout>
  </PrivateRoute>
)

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
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
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
        <Route path="category/:id" element={<Category />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="profile" element={<BuyerProfile />} />
        <Route path="orders" element={<BuyerOrders />} />
      </Route>

      {/* 404 - Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter