import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Store, Shield } from 'lucide-react'

const LoginSelection = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left Section - Selection */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
                {/* Back to Home */}
                <div className="absolute top-6 left-6">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Back to store
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto mt-12">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-gray-600 mt-2">Choose how you want to sign in</p>
                    </div>

                    <div className="space-y-4">
                        {/* Buyer Login */}
                        <Link
                            to="/login/buyer"
                            className="block w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all duration-200 group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
                                        <ShoppingBag className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-200" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Buyer Login</h3>
                                    <p className="text-sm text-gray-600">Sign in with your phone number and name</p>
                                </div>
                            </div>
                        </Link>

                        {/* Vendor/Admin Login */}
                        <Link
                            to="/login/vendor"
                            className="block w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-200 group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
                                        <Store className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-200" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Vendor / Admin Login</h3>
                                    <p className="text-sm text-gray-600">Sign in with your email and password</p>
                                </div>
                            </div>
                        </Link>
                    </div>

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

            {/* Right Section - Branding */}
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

export default LoginSelection
