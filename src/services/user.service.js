import api from './api'

const userService = {
  getUserProfile: () => api.get('/users/me'),

  updateUserProfile: (profileData) => api.put('/users/profile', profileData),

  updateProfileImage: (formData) =>
    api.put('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updatePassword: (passwordData) => api.put('/users/password', passwordData),

  manageAddresses: (addressData) => api.put('/users/addresses', addressData),

  getAllUsers: (params) => api.get('/users', { params }),

  updateUserRole: (userId, roleData) => api.put(`/users/${userId}/role`, roleData),

  deleteUser: (userId) => api.delete(`/users/${userId}`),
}

export default userService