import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Trash2, Check, CheckCheck, Filter, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Notifications = () => {
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotifications();

    const [filter, setFilter] = useState('ALL');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getNotificationIcon = (type) => {
        const iconClass = "h-6 w-6";
        switch (type) {
            case 'ORDER_CREATED':
                return <span className={`${iconClass}`}>🛒</span>;
            case 'ORDER_UPDATED':
                return <span className={`${iconClass}`}>📝</span>;
            case 'USER_REGISTERED':
                return <span className={`${iconClass}`}>👤</span>;
            case 'VENDOR_REGISTERED':
                return <span className={`${iconClass}`}>🏪</span>;
            case 'PRODUCT_PUBLISHED':
                return <span className={`${iconClass}`}>📦</span>;
            case 'PRODUCT_DELETED':
                return <span className={`${iconClass}`}>🗑️</span>;
            case 'PAYMENT_RECEIVED':
                return <span className={`${iconClass}`}>💰</span>;
            case 'LOW_STOCK':
                return <span className={`${iconClass}`}>⚠️</span>;
            default:
                return <Bell className={`${iconClass} text-gray-600`} />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'ORDER_CREATED':
            case 'ORDER_UPDATED':
                return 'bg-blue-100 border-blue-200';
            case 'USER_REGISTERED':
                return 'bg-green-100 border-green-200';
            case 'VENDOR_REGISTERED':
                return 'bg-purple-100 border-purple-200';
            case 'PRODUCT_PUBLISHED':
                return 'bg-orange-100 border-orange-200';
            case 'PRODUCT_DELETED':
                return 'bg-red-100 border-red-200';
            case 'PAYMENT_RECEIVED':
                return 'bg-green-100 border-green-200';
            case 'LOW_STOCK':
                return 'bg-yellow-100 border-yellow-200';
            default:
                return 'bg-gray-100 border-gray-200';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'ALL') return true;
        if (filter === 'UNREAD') return !n.read;
        return n.type.startsWith(filter);
    });

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications();
            toast.success('All notifications deleted');
            setShowDeleteConfirm(false);
        } catch (error) {
            toast.error('Failed to delete notifications');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete All
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {['ALL', 'UNREAD', 'ORDER', 'USER', 'VENDOR', 'PRODUCT', 'PAYMENT'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-600">
                        {filter === 'UNREAD' ? "You're all caught up!" : 'No notifications to display'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            onClick={() => handleNotificationClick(notification)}
                            className={`border-l-4 p-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${!notification.read ? 'border-l-blue-600 bg-blue-50' : 'border-l-gray-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                    {notification.type.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification._id);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete All Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-6 max-w-md w-full mx-4 shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete All Notifications</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete all notifications? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeleteAll}
                                className="flex-1 bg-red-600 text-white py-2 px-4 hover:bg-red-700 transition-colors"
                            >
                                Delete All
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
