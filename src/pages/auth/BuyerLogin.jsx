import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

const BuyerLogin = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        phone: '',
        name: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const from = location.state?.from?.pathname || location.state?.from || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.phone.trim()) {
            setError('Phone number is required')
            return
        }

        if (!formData.name.trim()) {
            setError('Name is required')
            return
        }

        setLoading(true)

        try {
            const credentials = {
                phone: formData.phone,
                name: formData.name
            }

            const result = await login(credentials)
            if (result.success) {
                navigate(from, { replace: true })
            } else {
                setError(result.error || 'Login failed')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
                <div className="absolute top-6 left-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Back to login options
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto mt-12">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Buyer Login</h1>
                        <p className="text-gray-600 mt-2">Sign in with your phone number and name</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                autoComplete="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                placeholder="e.g., 0712345678"
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                placeholder="Your Name"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in to your account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="mb-8">
                        <ShoppingBag className="w-20 h-20 text-white mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-white mb-4">JEIEN</h2>
                        <p className="text-xl text-blue-100">Premium Marketplace</p>
                    </div>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Premium Quality Products</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Secure & Fast Delivery</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>24/7 Customer Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BuyerLogin
