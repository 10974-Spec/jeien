import React, { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import authService from '../services/auth.service'

export const AuthContext = createContext()

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
      const response = await authService.getProfile()
      setUser(response.data.user)
    } catch (err) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.error('Failed to load user:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setError(null)
      
      return { success: true, user }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setError(null)
      
      return { success: true, user }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const googleLogin = async (tokenId) => {
    try {
      const response = await authService.googleAuth({ tokenId })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setError(null)
      
      return { success: true, user }
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/login'
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      const updatedUser = response.data.user
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return { success: true, user: updatedUser }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const updateProfileImage = async (imageFile) => {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await authService.updateProfileImage(formData)
      const updatedUser = response.data.user
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return { success: true, user: updatedUser }
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        updateProfileImage,
        loadUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}