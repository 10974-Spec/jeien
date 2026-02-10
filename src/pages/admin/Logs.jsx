import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import {
    FileText, Search, Filter, Calendar,
    User, ShoppingBag, Package, Settings,
    AlertCircle, CheckCircle, Info, XCircle,
    Clock, ChevronLeft, ChevronRight
} from 'lucide-react'

const Logs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const logsPerPage = 20

    useEffect(() => {
        fetchLogs()
    }, [filterType])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            // Generate mock logs since we don't have a logs endpoint
            const mockLogs = generateMockLogs()
            setLogs(mockLogs)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateMockLogs = () => {
        const types = ['order', 'user', 'product', 'payment', 'system']
        const actions = ['created', 'updated', 'deleted', 'processed', 'failed']
        const severities = ['info', 'success', 'warning', 'error']

        const mockData = []
        for (let i = 0; i < 100; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            const action = actions[Math.floor(Math.random() * actions.length)]
            const severity = severities[Math.floor(Math.random() * severities.length)]
            const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)

            mockData.push({
                id: `log-${i}`,
                type,
                action,
                severity,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${action}: Sample ${type} activity`,
                user: `User ${Math.floor(Math.random() * 100)}`,
                timestamp,
                details: `Additional details about this ${type} ${action} event`
            })
        }

        return mockData.sort((a, b) => b.timestamp - a.timestamp)
    }

    const getIcon = (type) => {
        switch (type) {
            case 'order':
                return <ShoppingBag className="h-4 w-4" />
            case 'user':
                return <User className="h-4 w-4" />
            case 'product':
                return <Package className="h-4 w-4" />
            case 'payment':
                return <FileText className="h-4 w-4" />
            case 'system':
                return <Settings className="h-4 w-4" />
            default:
                return <Info className="h-4 w-4" />
        }
    }

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            default:
                return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'order':
                return 'bg-purple-100 text-purple-800'
            case 'user':
                return 'bg-blue-100 text-blue-800'
            case 'product':
                return 'bg-green-100 text-green-800'
            case 'payment':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Filter logs
    const filteredLogs = logs.filter(log => {
        const matchesType = filterType === 'all' || log.type === filterType
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    // Pagination
    const indexOfLastLog = currentPage * logsPerPage
    const indexOfFirstLog = indexOfLastLog - logsPerPage
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading activity logs...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Monitor system activities and user actions
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="order">Orders</option>
                        <option value="user">Users</option>
                        <option value="product">Products</option>
                        <option value="payment">Payments</option>
                        <option value="system">System</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {log.timestamp.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                                            {getIcon(log.type)}
                                            {log.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                                            {getSeverityIcon(log.severity)}
                                            {log.severity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{log.message}</div>
                                        <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{log.user}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(indexOfLastLog, filteredLogs.length)}</span> of{' '}
                            <span className="font-medium">{filteredLogs.length}</span> logs
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Logs
