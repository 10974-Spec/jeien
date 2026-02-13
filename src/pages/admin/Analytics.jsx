import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, Eye, ShoppingCart, Clock,
    Monitor, Smartphone, Tablet, Activity
} from 'lucide-react';
import analyticsService from '../../services/analytics.service';

const Analytics = () => {
    const [period, setPeriod] = useState('7d');
    const [overview, setOverview] = useState(null);
    const [visitStats, setVisitStats] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topPages, setTopPages] = useState([]);
    const [deviceBreakdown, setDeviceBreakdown] = useState([]);
    const [realtimeVisitors, setRealtimeVisitors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();

        // Auto-refresh realtime visitors every 30 seconds
        const interval = setInterval(() => {
            fetchRealtimeVisitors();
        }, 30000);

        return () => clearInterval(interval);
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [overviewData, visitsData, productsData, pagesData, devicesData, realtimeData] = await Promise.all([
                analyticsService.getOverview(period),
                analyticsService.getVisitStats(period),
                analyticsService.getProductViews(period, 10),
                analyticsService.getTopPages(period, 10),
                analyticsService.getDeviceBreakdown(period),
                analyticsService.getRealtimeVisitors()
            ]);

            setOverview(overviewData.data);
            setVisitStats(visitsData.data);
            setTopProducts(productsData.data);
            setTopPages(pagesData.data);
            setDeviceBreakdown(devicesData.data);
            setRealtimeVisitors(realtimeData.data.visitors);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRealtimeVisitors = async () => {
        try {
            const data = await analyticsService.getRealtimeVisitors();
            setRealtimeVisitors(data.data.visitors);
        } catch (error) {
            console.error('Failed to fetch realtime visitors:', error);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Period Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track your site performance and user behavior</p>
                </div>
                <div className="flex items-center gap-2">
                    {['24h', '7d', '30d', '90d'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${period === p
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {p === '24h' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <Activity className="h-5 w-5 text-white/60" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-1">Total Visits</h3>
                    <p className="text-3xl font-bold">{overview?.totalVisits?.toLocaleString() || 0}</p>
                    <p className="text-white/70 text-xs mt-2">
                        {overview?.activeVisitors || 0} active now
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Eye className="h-6 w-6" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-white/60" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-1">Product Views</h3>
                    <p className="text-3xl font-bold">{overview?.productViews?.toLocaleString() || 0}</p>
                    <p className="text-white/70 text-xs mt-2">
                        {overview?.pageViews?.toLocaleString() || 0} total page views
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-white/60" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-1">Purchases</h3>
                    <p className="text-3xl font-bold">{overview?.purchases?.toLocaleString() || 0}</p>
                    <p className="text-white/70 text-xs mt-2">
                        {overview?.conversionRate || 0}% conversion rate
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Clock className="h-6 w-6" />
                        </div>
                        <Activity className="h-5 w-5 text-white/60" />
                    </div>
                    <h3 className="text-white/80 text-sm font-medium mb-1">Avg. Session</h3>
                    <p className="text-3xl font-bold">
                        {Math.floor((overview?.avgDuration || 0) / 60)}m {(overview?.avgDuration || 0) % 60}s
                    </p>
                    <p className="text-white/70 text-xs mt-2">Average time on site</p>
                </motion.div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visits Over Time */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visits Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={visitStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} />
                            <Line type="monotone" dataKey="uniqueUsers" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={deviceBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ device, count }) => `${device}: ${count}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {deviceBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        {deviceBreakdown.map((entry, index) => (
                            <div key={entry.device} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm text-gray-600">{entry.device}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Viewed Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="views" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Pages */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topPages}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="page" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="views" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Realtime Visitors */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Realtime Visitors ({realtimeVisitors.length})
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Live</span>
                    </div>
                </div>

                {realtimeVisitors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No active visitors right now</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Browser</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Page</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {realtimeVisitors.map((visitor, index) => (
                                    <tr key={visitor.sessionId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm font-medium">
                                                        {visitor.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{visitor.user.name}</p>
                                                    {visitor.user.email && (
                                                        <p className="text-xs text-gray-500">{visitor.user.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {visitor.device === 'Desktop' && <Monitor className="h-4 w-4 text-gray-400" />}
                                                {visitor.device === 'Mobile' && <Smartphone className="h-4 w-4 text-gray-400" />}
                                                {visitor.device === 'Tablet' && <Tablet className="h-4 w-4 text-gray-400" />}
                                                <span className="text-sm text-gray-900">{visitor.device}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {visitor.browser}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {visitor.currentPage}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(visitor.lastActivity).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
