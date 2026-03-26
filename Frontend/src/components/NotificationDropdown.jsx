import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import BuildIcon from '@mui/icons-material/Build';
import { formatDistanceToNow } from 'date-fns';
import {
    getNotifications,
    getUpcomingServiceLogs,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} from '../services/api';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [activeTab, setActiveTab] = useState('alerts');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notifRes, upcomingRes] = await Promise.all([
                getNotifications(),
                getUpcomingServiceLogs()
            ]);
            setNotifications(notifRes.data);
            setUpcomingServices(upcomingRes.data);
        } catch (error) {
            console.error('Error fetching notification data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markNotificationRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const maintenanceCount = upcomingServices.length;

    const getIconColor = (type) => {
        switch (type) {
            case 'warning': return 'bg-orange-100 text-orange-600';
            case 'success': return 'bg-emerald-100 text-emerald-600';
            case 'error': return 'bg-rose-100 text-rose-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-all duration-200 ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
            >
                <NotificationsIcon />
                {(unreadCount + maintenanceCount) > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {(unreadCount + maintenanceCount) > 9 ? '9+' : (unreadCount + maintenanceCount)}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed top-20 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    <div className="p-4 border-b border-gray-50 bg-white sticky top-0 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && activeTab === 'alerts' && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <MarkEmailReadIcon className="!text-sm" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'alerts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Alerts {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px]">{unreadCount}</span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('maintenance')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'maintenance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Maintenance {maintenanceCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px]">{maintenanceCount}</span>}
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading && (
                            <div className="p-8 text-center">
                                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {!loading && activeTab === 'alerts' && (
                            notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`mt-1 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                                                <NotificationsIcon className="!text-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-bold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap mt-0.5">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                                        <NotificationsIcon className="!text-3xl" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">No notifications yet</p>
                                </div>
                            )
                        )}

                        {!loading && activeTab === 'maintenance' && (
                            upcomingServices.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {upcomingServices.map((log) => (
                                        <div
                                            key={log._id}
                                            onClick={() => { navigate(`/devices/${log.device?._id}`); setIsOpen(false); }}
                                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group"
                                        >
                                            <div className="mt-1 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-500">
                                                <BuildIcon className="!text-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {log.device?.assetTag} - {log.device?.model}
                                                </p>
                                                <p className="text-xs text-orange-600 font-bold mt-0.5">
                                                    Due on {new Date(log.nextServiceDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">
                                                    Last: {log.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                                        <BuildIcon className="!text-3xl" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">No maintenance tasks</p>
                                    <p className="text-xs text-gray-400 mt-1">Units due for service in the next 7 days will appear here.</p>
                                </div>
                            )
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                        <button
                            className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
