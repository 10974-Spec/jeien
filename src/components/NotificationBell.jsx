import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        const iconClass = "h-5 w-5";
        switch (type) {
            case 'ORDER_CREATED':
                return <span className={`${iconClass} text-blue-600`}>🛒</span>;
            case 'USER_REGISTERED':
                return <span className={`${iconClass} text-green-600`}>👤</span>;
            case 'VENDOR_REGISTERED':
                return <span className={`${iconClass} text-purple-600`}>🏪</span>;
            case 'PRODUCT_PUBLISHED':
                return <span className={`${iconClass} text-orange-600`}>📦</span>;
            case 'PRODUCT_DELETED':
                return <span className={`${iconClass} text-red-600`}>🗑️</span>;
            case 'PAYMENT_RECEIVED':
                return <span className={`${iconClass} text-green-600`}>💰</span>;
            default:
                return <span className={`${iconClass} text-gray-600`}>🔔</span>;
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {recentNotifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentNotifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center gap-2">
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(e, notification._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {recentNotifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <Link
                                    to="/admin/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                                >
                                    View all notifications →
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
