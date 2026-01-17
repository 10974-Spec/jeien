// hooks/useRole.js
import { useAuth } from '../contexts/AuthContext'

export const useRole = () => {
  const { user } = useAuth()

  const getUserRole = () => {
    return user?.role || 'buyer' // Default to 'buyer' if no role
  }

  const getDashboardPath = () => {
    const role = getUserRole()
    
    // Handle both uppercase and lowercase roles
    switch(role.toUpperCase()) {
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return '/admin/dashboard'
      case 'VENDOR':
      case 'SELLER':
        return '/vendor/dashboard'
      case 'BUYER':
      case 'USER':
      case 'CUSTOMER':
      default:
        return '/profile'
    }
  }

  const isAdmin = () => {
    const role = getUserRole()
    return role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'ADMINISTRATOR'
  }
  
  const isVendor = () => {
    const role = getUserRole()
    return role.toUpperCase() === 'VENDOR' || role.toUpperCase() === 'SELLER'
  }
  
  const isBuyer = () => {
    const role = getUserRole()
    const upperRole = role.toUpperCase()
    return upperRole === 'BUYER' || upperRole === 'USER' || upperRole === 'CUSTOMER'
  }

  return {
    getUserRole,
    getDashboardPath,
    isAdmin,
    isVendor,
    isBuyer
  }
}