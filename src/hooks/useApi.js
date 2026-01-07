import { useState, useCallback } from 'react'
import api from '../services/api'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const callApi = useCallback(async (method, url, requestData = null, config = {}) => {
    setLoading(true)
    setError(null)

    try {
      let response
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(url, { ...config, params: requestData })
          break
        case 'post':
          response = await api.post(url, requestData, config)
          break
        case 'put':
          response = await api.put(url, requestData, config)
          break
        case 'delete':
          response = await api.delete(url, { ...config, data: requestData })
          break
        case 'patch':
          response = await api.patch(url, requestData, config)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      setData(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearData = useCallback(() => {
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    callApi,
    clearError,
    clearData,
    get: useCallback((url, params, config) => callApi('get', url, params, config), [callApi]),
    post: useCallback((url, data, config) => callApi('post', url, data, config), [callApi]),
    put: useCallback((url, data, config) => callApi('put', url, data, config), [callApi]),
    delete: useCallback((url, data, config) => callApi('delete', url, data, config), [callApi]),
    patch: useCallback((url, data, config) => callApi('patch', url, data, config), [callApi]),
  }
}