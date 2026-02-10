import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import {
    TrendingUp, DollarSign, ShoppingBag, Package,
    Users, Calendar, Download, Filter,
    ArrowUpRight, ArrowDownRight, BarChart3,
    PieChart, Activity
} from 'lucide-react'

const Reports = () => {
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('month') // day, week, month, year
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        topProducts: [],
        topVendors: [],
        revenueByCategory: []
    })

    useEffect(() => {
        fetchAnalytics()
    }, [timeRange])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const [ordersRes, productsRes, usersRes, vendorsRes] = await Promise.all([
                api.get(`/orders/admin/all?timeRange=${timeRange}`),
                api.get('/products?limit=10&sortBy=stats.sales'),
                api.get('/users'),
                api.get('/vendors/all')
            ])

            setAnalytics({
                totalRevenue: ordersRes.data.analytics?.totalRevenue || 0,
                totalOrders: ordersRes.data.analytics?.totalOrders || 0,
                totalProducts: productsRes.data.total || 0,
                totalUsers: usersRes.data.total || 0,
                revenueGrowth: Math.random() * 20 - 5, // Mock data
                ordersGrowth: Math.random() * 20 - 5, // Mock data
                topProducts: productsRes.data.products || [],
                topVendors: vendorsRes.data.vendors?.slice(0, 5) || [],
                revenueByCategory: [] // Mock data
            })
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        alert('Export functionality coming soon!')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading analytics...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Track your business performance and insights
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range Filter */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                KES {analytics.totalRevenue.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        {analytics.revenueGrowth >= 0 ? (
                            <>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 font-medium">+{analytics.revenueGrowth.toFixed(1)}%</span>
                            </>
                        ) : (
                            <>
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                <span className="text-red-600 font-medium">{analytics.revenueGrowth.toFixed(1)}%</span>
                            </>
                        )}
                        <span className="text-gray-500 ml-2">vs last period</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {analytics.totalOrders.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        {analytics.ordersGrowth >= 0 ? (
                            <>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 font-medium">+{analytics.ordersGrowth.toFixed(1)}%</span>
                            </>
                        ) : (
                            <>
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                <span className="text-red-600 font-medium">{analytics.ordersGrowth.toFixed(1)}%</span>
                            </>
                        )}
                        <span className="text-gray-500 ml-2">vs last period</span>
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {analytics.totalProducts.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Active listings
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {analytics.totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Registered accounts
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Top Selling Products
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.topProducts.map((product, index) => (
                            <div key={product._id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </div>
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/48'}
                                    alt={product.title}
                                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                                    <p className="text-sm text-gray-500">
                                        {product.stats?.sales || 0} sales
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-700">
                                        KES {product.price?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Top Vendors
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.topVendors.map((vendor, index) => (
                            <div key={vendor._id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {vendor.businessName || vendor.user?.name || 'Unknown Vendor'}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {vendor.products?.length || 0} products
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        Active
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Trends (Placeholder) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Revenue Trends
                    </h3>
                </div>
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">Chart visualization coming soon</p>
                        <p className="text-xs mt-1">Integrate with a charting library like Chart.js or Recharts</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports
