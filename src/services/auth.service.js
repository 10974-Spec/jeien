import api from './api'

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  
  register: (userData) => api.post('/auth/register', userData),
  
  googleAuth: (data) => api.post('/auth/google', data),
  
  facebookAuth: (data) => api.post('/auth/facebook', data),
  
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