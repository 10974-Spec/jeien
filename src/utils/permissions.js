import { USER_ROLES } from './constants'

/**
 * Check if user has required role
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false
  
  const userRole = user.role
  
  // Admin has all privileges
  if (userRole === USER_ROLES.ADMIN) return true
  
  // Vendor can access vendor routes
  if (requiredRole === USER_ROLES.VENDOR && userRole === USER_ROLES.VENDOR) return true
  
  // Buyer can access buyer routes
  if (requiredRole === USER_ROLES.BUYER && userRole === USER_ROLES.BUYER) return true
  
  return userRole === requiredRole
}

/**
 * Check if user can access route
 */
export const canAccess = (user, allowedRoles = []) => {
  if (!user || !user.role) return false
  
  if (user.role === USER_ROLES.ADMIN) return true
  
  return allowedRoles.includes(user.role)
}

/**
 * Get dashboard path based on role
 */
export const getDashboardPath = (user) => {
  if (!user) return '/'
  
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return '/admin/dashboard'
    case USER_ROLES.VENDOR:
      return '/vendor/dashboard'
    case USER_ROLES.BUYER:
      return '/profile'
    default:
      return '/'
  }
}

/**
 * Check if user can manage resource
 */
export const canManageResource = (user, resourceOwnerId) => {
  if (!user || !user._id) return false
  
  // Admin can manage any resource
  if (user.role === USER_ROLES.ADMIN) return true
  
  // Users can only manage their own resources
  return user._id === resourceOwnerId
}

/**
 * Check if user can approve/reject content
 */
export const canModerate = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can create products
 */
export const canCreateProducts = (user) => {
  return user && (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.ADMIN)
}

/**
 * Check if user can view vendor dashboard
 */
export const canViewVendorDashboard = (user) => {
  return user && (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.ADMIN)
}

/**
 * Check if user can view admin dashboard
 */
export const canViewAdminDashboard = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can process payments
 */
export const canProcessPayments = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can manage users
 */
export const canManageUsers = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can manage vendors
 */
export const canManageVendors = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can manage categories
 */
export const canManageCategories = (user) => {
  return user && user.role === USER_ROLES.ADMIN
}

/**
 * Check if user can manage banners
 */
export const canManageBanners = (user) => {
  return user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.VENDOR)
}

/**
 * Get user permissions object
 */
export const getUserPermissions = (user) => {
  if (!user) return {}
  
  return {
    canCreateProducts: canCreateProducts(user),
    canViewVendorDashboard: canViewVendorDashboard(user),
    canViewAdminDashboard: canViewAdminDashboard(user),
    canProcessPayments: canProcessPayments(user),
    canManageUsers: canManageUsers(user),
    canManageVendors: canManageVendors(user),
    canManageCategories: canManageCategories(user),
    canManageBanners: canManageBanners(user),
    canModerate: canModerate(user),
  }
}