import React, { useState, useEffect } from 'react'
import userService from '../../services/user.service'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      
      const response = await userService.getAllUsers(params)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, { role: newRole })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Roles</option>
            <option value="BUYER">Buyers</option>
            <option value="VENDOR">Vendors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">User</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Phone</th>
                  <th className="text-left py-3">Role</th>
                  <th className="text-left py-3">Joined</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            👤
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{user.email}</td>
                    <td className="py-4">{user.phone || 'N/A'}</td>
                    <td className="py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="BUYER">Buyer</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers