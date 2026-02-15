import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Breadcrumb = ({ items }) => {
    const { isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <nav className="flex items-center text-sm overflow-x-auto whitespace-nowrap no-scrollbar">
                    {items.map((item, index) => (
                        <React.Fragment key={item.path || index}>
                            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className={`${index === items.length - 1
                                            ? 'text-gray-900 font-medium cursor-default pointer-events-none'
                                            : 'text-gray-600 hover:text-orange-600'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-medium">{item.name}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="md:hidden flex items-center ml-4">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Breadcrumb
