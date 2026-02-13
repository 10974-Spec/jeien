import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notification.service';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user || user.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ limit: 50 });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!user || user.role !== 'ADMIN') return;

        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    // Mark as read
    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            // Decrease unread count if notification was unread
            const notification = notifications.find(n => n._id === id);
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            throw error;
        }
    };

    // Delete all notifications
    const deleteAllNotifications = async () => {
        try {
            await notificationService.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
            throw error;
        }
    };

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchNotifications();

            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [user]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
