// hooks/useRole.js
import { useAuth } from './useAuth'

export const useRole = () => {
  const { user } = useAuth()

  const getUserRole = () => {
    return user?.role || 'buyer' // Default to 'buyer' if no role
  }

  const getDashboardPath = () => {
    const role = getUserRole()
    
    switch(role) {
      case 'admin':
        return '/admin/dashboard'
      case 'vendor':
        return '/vendor/dashboard'
      case 'buyer':
      default:
        return '/profile' // or '/user/dashboard' if you have one
    }
  }

  const isAdmin = () => getUserRole() === 'admin'
  const isVendor = () => getUserRole() === 'vendor'
  const isBuyer = () => getUserRole() === 'buyer'

  return {
    getUserRole,
    getDashboardPath,
    isAdmin,
    isVendor,
    isBuyer
  }
}