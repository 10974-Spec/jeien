import React, { createContext, useState, useContext } from 'react'
import { AuthContext } from './AuthContext'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])

  const getRole = () => {
    return user?.role || 'GUEST'
  }

  const isAdmin = () => {
    return getRole() === 'ADMIN'
  }

  const isVendor = () => {
    return getRole() === 'VENDOR' || isAdmin()
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

  return (
    <UserContext.Provider
      value={{
        profile,
        addresses,
        setProfile,
        setAddresses,
        getRole,
        isAdmin,
        isVendor,
        isBuyer,
        canAccess,
        getDashboardPath,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}