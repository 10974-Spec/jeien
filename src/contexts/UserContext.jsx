import React, { createContext, useState, useContext, useEffect } from 'react'

// Create and export UserContext
export const UserContext = createContext({
  user: null,
  profile: null,
  addresses: [],
  setUser: () => {},
  setProfile: () => {},
  setAddresses: () => {},
  getRole: () => 'GUEST',
  isAdmin: () => false,
  isVendor: () => false,
  isBuyer: () => false,
  canAccess: () => false,
  getDashboardPath: () => '/',
})

// Custom hook for using UserContext
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
        } catch (error) {
          console.error('Failed to parse user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const getRole = () => {
    return user?.role || 'GUEST'
  }

  const isAdmin = () => {
    return getRole() === 'ADMIN'
  }

  const isVendor = () => {
    const role = getRole()
    return role === 'VENDOR' || role === 'ADMIN'
  }

  const isBuyer = () => {
    return getRole() === 'BUYER'
  }

  const canAccess = (requiredRole) => {
    const userRole = getRole()
    
    if (requiredRole === 'ADMIN') return userRole === 'ADMIN'
    if (requiredRole === 'VENDOR') return userRole === 'VENDOR' || userRole === 'ADMIN'
    if (requiredRole === 'BUYER') return userRole === 'BUYER' || userRole === 'VENDOR' || userRole === 'ADMIN'
    
    return false
  }

  const getDashboardPath = () => {
    const role = getRole()
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'VENDOR') return '/vendor/dashboard'
    return '/'
  }

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setProfile(null)
    setAddresses([])
  }

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const value = {
    user,
    profile,
    addresses,
    loading,
    setUser,
    setProfile,
    setAddresses,
    getRole,
    isAdmin,
    isVendor,
    isBuyer,
    canAccess,
    getDashboardPath,
    login,
    logout,
    updateUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext