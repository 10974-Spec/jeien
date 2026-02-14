import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, Store } from 'lucide-react'

const VendorLogin = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const from = location.state?.from?.pathname || location.state?.from || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.email.trim()) {
            setError('Email is required')
            return
        }

        if (!formData.password) {
            setError('Password is required')
            return
        }

        setLoading(true)

        try {
            const credentials = {
                email: formData.email,
                password: formData.password
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
                        <h1 className="text-3xl font-bold text-gray-900">Vendor / Admin Login</h1>
                        <p className="text-gray-600 mt-2">Sign in with your email and password</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-green-600 hover:text-green-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in to your account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Want to become a vendor?{' '}
                            <Link to="/vendor/register" className="font-medium text-green-600 hover:text-green-700">
                                Apply now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="mb-8">
                        <Store className="w-20 h-20 text-white mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-white mb-4">JEIEN</h2>
                        <p className="text-xl text-green-100">Vendor Portal</p>
                    </div>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Manage Your Products</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Track Orders & Sales</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Grow Your Business</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorLogin
