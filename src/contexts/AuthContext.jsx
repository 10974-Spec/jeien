import React, { createContext, useState, useEffect, useCallback, useContext } from 'react'
import api from '../services/api'

// Create and export AuthContext
export const AuthContext = createContext()

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Set auth header
      api.raw.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Get user profile
      const response = await api.get('/auth/me')
      if (response.data.success) {
        setUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    } catch (err) {
      console.error('Failed to load user:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.raw.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    try {
      console.log('Logging in with:', email)
      
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response:', response.data)
      
      if (response.data.success && response.data.token) {
        const { token, user } = response.data
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Set auth header
        api.raw.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Update state
        setUser(user)
        setError(null)
        
        return { success: true, user }
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const testLogin = async (email, password) => {
    try {
      console.log('Test login with:', email)
      
      const response = await api.post('/auth/test-login', { email, password })
      console.log('Test login response:', response.data)
      
      if (response.data.success && response.data.token) {
        const { token, user } = response.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        api.raw.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        setUser(user)
        setError(null)
        
        return { success: true, user }
      }
    } catch (err) {
      console.error('Test login error:', err)
      return { success: false, error: err.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success && response.data.token) {
        const { token, user } = response.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        api.raw.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        setError(null)
        
        return { success: true, user }
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.raw.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    loading,
    error,
    login,
    testLogin,
    register,
    logout,
    loadUser,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext