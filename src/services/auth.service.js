import api from './api'

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (userData) => api.post('/auth/register', userData),

  // Password reset
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),

  verifyResetToken: (token) => api.get(`/auth/reset-password/${token}`),

  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),

  // OAuth
  googleAuth: (data) => api.post('/auth/google', data),

  facebookAuth: (data) => api.post('/auth/facebook', data),

  // Profile
  getProfile: () => api.get('/auth/me'),

  updateProfile: (profileData) => api.put('/auth/profile', profileData),

  updateProfileImage: (formData) =>
    api.put('/auth/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updatePassword: (passwordData) => api.put('/users/password', passwordData),
}

export default authService