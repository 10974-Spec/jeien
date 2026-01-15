import { useUser } from '../contexts/UserContext'

export const useRole = () => {
  const context = useUser() // Changed from useContext(UserContext) to useUser()
  
  if (!context) {
    throw new Error('useRole must be used within an UserProvider')
  }
  
  // Return only the role-related functions for cleaner API
  return {
    getRole: context.getRole,
    isAdmin: context.isAdmin,
    isVendor: context.isVendor,
    isBuyer: context.isBuyer,
    canAccess: context.canAccess,
    getDashboardPath: context.getDashboardPath,
    user: context.user
  }
}